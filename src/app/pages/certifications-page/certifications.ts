import { Component, inject, ViewChild, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { catchError, debounceTime, map, merge, of, startWith, switchMap, tap, Observable, filter } from 'rxjs'; 
import { DatePipe, NgClass } from '@angular/common';
import { CertificationsService } from './services/certifications.service'; 
import { CertificationDetails, CertificationModalData } from './components/certifification-details/certification-details'; 
import { 
    Certification, 
    CertificationFilterDTO, 
    PaginatedCertificationsResponse 
} from './models/certification-models';

@Component({
  selector: 'app-certifications-page',
  standalone: true,
  imports: [
    MatIconModule, MatButtonModule, MatTableModule, MatPaginatorModule, 
    MatCardModule, MatFormFieldModule, MatProgressSpinnerModule, 
    ReactiveFormsModule, MatInputModule, MatDialogModule, MatTooltipModule, 
    MatSelectModule,NgClass, DatePipe
  ],
    providers: [
    DatePipe 
  ],
  templateUrl: './certifications.html',
  styleUrl: './certifications.scss',
})
export class CertificationsPage implements AfterViewInit {
    // Tipo do serviço explicitamente definido. O inject() já resolve o tipo,
    // mas adicionamos aqui para evitar o erro 'unknown' caso o ambiente falhe na inferência.
  private certificationsService: CertificationsService = inject(CertificationsService);
  private readonly dialog = inject(MatDialog);

  // Colunas da tabela de Certificações
  displayedColumns: string[] = ['title', 'status', 'questionsCount', 'validUntil', 'pdfFile','actions'];
  dataSource: Certification[] = [];
  totalCertifications = 0;
  isLoading = true;
  isDeleting = false; // Estado para gerenciar o carregamento de exclusão

  // Estados disponíveis para filtro
  availableStatuses = ['Ativa', 'Inativa'];

  // Tipagem explícita nos FormControls (string | null)
  filterForm = new FormGroup({
    title: new FormControl<string | null>(''),
    status: new FormControl<string | null>(null),
  });

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    
    // --- CORREÇÃO DA LÓGICA DE CARREGAMENTO ---

    // 1. Subscrição de Filtros: Apenas para reiniciar o paginador
    // Esta subscrição "escuta" as mudanças no formulário de filtro.
    this.filterForm.valueChanges.pipe(
        debounceTime(300), // Espera o utilizador parar de digitar
        tap(() => {
            // Se o utilizador mudou o filtro e NÃO está na página 1...
            if (this.paginator.pageIndex !== 0) {
                // ...reinicia o paginador.
                this.paginator.pageIndex = 0;
                
                // IMPORTANTE: Ao reiniciar o paginador (acima),
                // o evento (this.paginator.page) será disparado.
                // Isso ativa a Subscrição 2 (abaixo) e carrega os dados.
                // Esta subscrição (Sub 1) não deve fazer mais nada.
            }
        })
    ).subscribe();

    // 2. Subscrição Principal: Carrega os dados
    // Esta subscrição é a ÚNICA fonte da verdade para carregar dados.
    // Ela dispara em duas situações:
    //    a) Quando o paginador muda (this.paginator.page)
    //    b) Quando o filtro muda, MAS o utilizador JÁ ESTAVA na página 0
    //       (o 'filter' abaixo garante isso)
    merge(
        this.paginator.page, // Dispara na mudança de página
        this.filterForm.valueChanges.pipe(
            debounceTime(300),
            // Só deixa este evento passar se o paginador JÁ ESTIVER em 0
            // (Se não estivesse, a Sub 1 acima o reiniciaria)
            filter(() => this.paginator.pageIndex === 0) 
        )
    ).pipe(
        startWith({} as any), // Dispara a carga inicial
        // Define isLoading = true ANTES da chamada de API
        tap(() => this.isLoading = true), 
        // switchMap cancela cargas anteriores e faz a nova
        switchMap(() => this.loadCertifications()), 
        map((response: PaginatedCertificationsResponse) => { 
          // Define isLoading = false DEPOIS que os dados chegam
          this.isLoading = false; 
          this.totalCertifications = response.total;
          return response.data;
        }),
        catchError(error => {
          console.error('Erro ao carregar certificações:', error);
          this.isLoading = false;
          return of([]); 
        })
    ).subscribe(data => {
        // Atualiza a fonte de dados da tabela
        this.dataSource = data;
    });
  }
  
  /**
    * Função auxiliar para carregar as certificações com os filtros atuais.
   * Agora retorna explicitamente um Observable de PaginatedCertificationsResponse
    */
  loadCertifications(): Observable<PaginatedCertificationsResponse> {
    //this.isLoading = true;
    
    const filters = this.filterForm.value as { title: string | null, status: string | null };
    let isActiveFilter: boolean | null = null;
    if (filters.status === 'Ativa') {
        isActiveFilter = true;
    } else if (filters.status === 'Inativa') {
        isActiveFilter = false;
    }
    
    const filterDTO: CertificationFilterDTO = {
        page: this.paginator.pageIndex + 1,
        limit: this.paginator.pageSize,
        title: filters.title,
        isActive: isActiveFilter 
    };

    return this.certificationsService.findAllCertifications(filterDTO);
  }
  /**
    * Abre o modal para ver os detalhes ou editar uma certificação.
    */
  openCertificationDetails(cert: Certification): void {
    const data: CertificationModalData = { 
      certificationId: cert.id, 
      isCreation: false, 
      certification: cert 
    };

    this.dialog.open(CertificationDetails, {
      width: '900px',
      maxWidth: '95vw',
      data: data,
    }).afterClosed().subscribe(result => {
        if (result) {
            this.paginator.page.emit(); // Recarrega após edição/detalhes
        }
    });
  }

  /**
    * Abre o modal para adicionar uma nova certificação.
    */
  addCertification(): void {
    const data: CertificationModalData = { 
      certificationId: null, // ID é null na criação
      isCreation: true 
    };
    
    this.dialog.open(CertificationDetails, {
      width: '900px',
      maxWidth: '95vw',
      data: data,
    }).afterClosed().subscribe(result => {
        if (result) {
            this.paginator.page.emit(); // Força o reload da lista
        }
    });
  }
  
  /**
   * Exclui uma certificação e recarrega a lista.
   */
  deleteCertification(id: string): void {
    if (confirm('Tem certeza que deseja excluir esta certificação?')) {
        this.isDeleting = true; 
        
        this.certificationsService.deleteCertification(id).pipe(
            tap(() => console.log(`Certificação ${id} excluída com sucesso.`)),
            catchError(error => {
                console.error('Erro ao excluir certificação:', error);
                alert('Erro ao excluir. Verifique o console.'); 
                this.isDeleting = false;
                return of(null);
            })
        ).subscribe(result => {
            this.isDeleting = false;
            if (result !== null) {
                // Se for chamado de dentro do modal, o modal deve fechar e
                // o 'afterClosed()' da página principal vai recarregar.
                // Se for chamado da página principal (como estava antes),
                // esta linha recarrega.
                this.paginator.page.emit(); // Força o reload da lista
            }
        });
    }
  }

  resetFilters() {

 // 1. Reseta o formulário
    this.filterForm.reset({ title: '', status: null });

    // 2. Verifica se o paginador já está na página 0
    if (this.paginator.pageIndex === 0) {
        // 3a. Se já estiver na página 0, o 'pageIndex = 0' (da Sub 1) não vai
        // disparar um evento. Precisamos forçar a carga manualmente.
        // A forma mais fácil é pedir ao 'merge' (Sub 2) para recarregar.
        // O startWith({}) não funciona aqui, então disparamos uma carga direta.
        this.isLoading = true;
        this.loadCertifications().pipe(
             map((response: PaginatedCertificationsResponse) => { 
                console.log('RESPOSTA BRUTA DA API (findAll):', response);
                this.isLoading = false; 
                this.totalCertifications = response.total;
                return response.data;
             }),
             catchError(error => {
                console.error('Erro ao carregar certificações:', error);
                this.isLoading = false;
                return of([]); 
             })
        ).subscribe(data => {
            this.dataSource = data;
        });
    } else {
        // 3b. Se NÃO estiver na página 0, a Sub 1 (valueChanges) 
        // vai detetar a mudança, vai definir pageIndex = 0, 
        // e isso VAI disparar a Sub 2 (paginator.page) para carregar.
        // Não precisamos fazer mais nada aqui.
    }
  }
}
