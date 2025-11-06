// Caminho: src/app/pages/certifications-page/certifications-list.component.ts
import { Component, inject, ViewChild, AfterViewInit, OnInit, ElementRef } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule, MatTableDataSource } from '@angular/material/table'; 
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { catchError, debounceTime, map, merge, of, startWith, switchMap, tap, Observable, filter, distinctUntilChanged, finalize } from 'rxjs'; // Adicionado imports RxJS
import { DatePipe, NgClass, CommonModule } from '@angular/common'; 
import { CertificationsService } from '../../services/certifications.service'; 
import { CertificationDetails, CertificationModalData } from '../../components/certifification-details/certification-details'; 
import { 
    Certification, 
    CertificationFilterDTO, 
    PaginatedCertificationsResponse 
} from '../../../shared/models/certification.models';
import { CertificationsListComponent } from '../../components/certifications-list/certifications-list.component';

@Component({
  selector: 'app-certifications-page',
  standalone: true,
  imports: [
    CommonModule, //--(Necessário para @if/@for no HTML)
    MatIconModule, MatButtonModule, MatTableModule, MatPaginatorModule, 
    MatCardModule, MatFormFieldModule, MatProgressSpinnerModule, 
    ReactiveFormsModule, MatInputModule, MatDialogModule, MatTooltipModule, 
    MatSelectModule, NgClass, DatePipe,
    MatSnackBarModule, CertificationsListComponent // <-- ADICIONADO
  ],
    providers: [
    DatePipe 
  ],
  templateUrl: './certifications-page.component.html',
  styleUrl: './certifications-page.component.scss',
})
export class CertificationsPage implements AfterViewInit, OnInit { 
  
  // --- INJECT  ---
  private certificationsService: CertificationsService = inject(CertificationsService);
  private readonly dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar); // <-- ADICIONADO

  displayedColumns: string[] = ['title', 'status', 'questionsCount', 'validUntil', 'pdfFile','actions'];
  dataSource = new MatTableDataSource<Certification>([]); 
  totalCertifications = 0;
  isLoading = true;
  isDeleting = false; 
  isUploadingPdf = false; 

  availableStatuses = ['Ativa', 'Inativa'];

  filterForm = new FormGroup({
    title: new FormControl<string | null>(''),
    status: new FormControl<string | null>(null),
  });

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  // <-- ADICIONADO (para o input de arquivo invisível)
  @ViewChild('pdfUploadInput') pdfUploadInput!: ElementRef<HTMLInputElement>;
  private uploadTargetCertificationId: string | null = null;
  
  // Adicionado ngOnInit para segurança
  ngOnInit(): void {
    // (A lógica de 'merge' foi movida para ngAfterViewInit, que é o correto)
  }


  ngAfterViewInit() {
    // A lógica de atualização de colunas deve vir aqui
    // this.updateDisplayedColumns();

    // --- CORREÇÃO: LÓGICA DE CARREGAMENTO PRINCIPAL ---
    // O 'merge' escuta a paginação E os filtros
    merge(
      this.paginator.page,
      this.filterForm.valueChanges.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => {
          // Se o filtro mudou, SEMPRE volte para a primeira página
          if (this.paginator.pageIndex !== 0) {
            this.paginator.pageIndex = 0;
          }
        })
      )
    ).pipe(
        startWith({}), // Carga inicial
        tap(() => this.isLoading = true), 
        switchMap(() => this.loadCertifications()), // Chama a função de carga
        map((response: PaginatedCertificationsResponse) => { 
          this.isLoading = false; 
          this.totalCertifications = response.total;
          return response.data;
        }),
        catchError(error => {
          console.error('Erro ao carregar certificações:', error);
          this.isLoading = false;
          // (Opcional) Mostrar snackbar de erro aqui
          return of([]); 
        })
    ).subscribe(data => {
        this.dataSource.data = data; // Atualiza o MatTableDataSource
    });
  }
  
  /**
   * Função auxiliar para carregar as certificações.
   * Retorna um Observable com a resposta paginada.
   */
  loadCertifications(): Observable<PaginatedCertificationsResponse> {
    const filters = this.filterForm.value as { title: string | null, status: string | null };
    let isActiveFilter: boolean | null = null;
    if (filters.status === 'Ativa') {
        isActiveFilter = true;
    } else if (filters.status === 'Inativa') {
        isActiveFilter = false;
    }
    
    const filterDTO: CertificationFilterDTO = {
        page: this.paginator ? this.paginator.pageIndex + 1 : 1, // Garante que paginator exista
        limit: this.paginator ? this.paginator.pageSize : 10, // Garante que paginator exista
        title: filters.title || undefined, // Envia undefined se for nulo ou ''
        isActive: isActiveFilter 
    };

    return this.certificationsService.findAllCertifications(filterDTO);
  }

  /**
   * Recarrega os dados da tabela forçando o 'merge' a disparar.
   */
  private reloadData(): void {
    // Disparar o evento de página força o 'merge' a rodar de novo
    this.paginator.page.emit({
      pageIndex: this.paginator.pageIndex,
      pageSize: this.paginator.pageSize,
      length: this.paginator.length
    });
  }

  /**
   * Abre o modal para ver os detalhes ou editar.
   * (Seu código original, está perfeito)
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
            this.reloadData(); // Recarrega após edição
        }
    });
  }

  /**
   * Abre o modal para adicionar uma nova certificação.
   * (Seu código original, está perfeito)
   */
  addCertification(): void {
    const data: CertificationModalData = { 
      certificationId: null,
      isCreation: true 
    };
    
    this.dialog.open(CertificationDetails, {
      width: '900px',
      maxWidth: '95vw',
      data: data,
    }).afterClosed().subscribe(result => {
        if (result) {
            this.reloadData(); // Recarrega após adição
        }
    });
  }
  
  /**
   * Exclui uma certificação.
   * (Seu código original, mas usando reloadData())
   */
  deleteCertification(id: string): void {
    if (confirm('Tem certeza que deseja excluir esta certificação?')) {
        this.isDeleting = true; 
        
        this.certificationsService.deleteCertification(id).pipe(
            tap(() => console.log(`Certificação ${id} excluída com sucesso.`)),
            catchError(error => {
              console.error('Erro ao excluir certificação:', error);
              this.snackBar.open('Erro ao excluir. Tente novamente.', 'Fechar', { duration: 3000 });
              this.isDeleting = false;
              return of(null);
            }),
            finalize(() => this.isDeleting = false) // Garante que isDeleting finalize
        ).subscribe(result => {
            if (result !== null) {
              this.reloadData(); // Recarrega a lista
            }
        });
    }
  }

  /**
   * Reseta os filtros e recarrega a tabela.
   * (Seu código original, mas simplificado)
   */
  resetFilters() {
    this.filterForm.reset({ title: '', status: null });
    // O 'merge' vai pegar essa mudança (via valueChanges)
    // e recarregar a tabela, resetando o paginador.
  }

  // --- 3. MÉTODOS NOVOS PARA UPLOAD DE PDF ---

  /**
   * Aciona o clique no input de arquivo invisível.
   */
  triggerPdfUpload(certificationId: string): void {
    if (this.isUploadingPdf) return;
    
    this.uploadTargetCertificationId = certificationId;
    
    if (this.pdfUploadInput.nativeElement) {
      this.pdfUploadInput.nativeElement.value = '';
    }
    
    this.pdfUploadInput.nativeElement.click();
  }

  /**
   * Chamado quando o usuário seleciona um arquivo no input invisível.
   */
  onPdfFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length || !this.uploadTargetCertificationId) {
      return;
    }

    const file = input.files[0];
    const certId = this.uploadTargetCertificationId; 
    
    this.isUploadingPdf = true;
    this.snackBar.open(`Enviando ${file.name}...`, 'Fechar');

    this.certificationsService.uploadCertificationPdf(certId, file).subscribe({
      next: (updatedCertification) => {
        this.isUploadingPdf = false;
        this.snackBar.open('PDF atualizado com sucesso!', 'OK', { duration: 3000 });
        
        // Atualiza a lista
        this.reloadData();
      },
      error: (err) => {
        console.error("Erro ao enviar PDF:", err);
        this.isUploadingPdf = false;
        this.snackBar.open('Falha ao enviar o PDF. Tente novamente.', 'Fechar', { duration: 4000 });
      },
      complete: () => {
        this.uploadTargetCertificationId = null;
      }
    });
  }
}