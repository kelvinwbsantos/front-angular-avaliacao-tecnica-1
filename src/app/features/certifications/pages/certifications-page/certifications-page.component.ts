import { Component, inject, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
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
import { catchError, debounceTime, distinctUntilChanged, finalize, of } from 'rxjs'; 
import { DatePipe, NgClass, CommonModule } from '@angular/common'; 
import { CertificationsService } from '../../services/certifications.service'; 
import { CertificationDetails, CertificationModalData } from '../../components/certifification-details/certification-details'; 
import { 
    CompleteCertification, 
    CertificationFilterDTO, 
    PaginatedCertificationsResponse 
} from '../../../shared/models/certification.models';
import { CertificationsListComponent } from '../../components/certifications-list/certifications-list.component';

@Component({
  selector: 'app-certifications-page',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule, MatButtonModule, MatTableModule, MatPaginatorModule, 
    MatCardModule, MatFormFieldModule, MatProgressSpinnerModule, 
    ReactiveFormsModule, MatInputModule, MatDialogModule, MatTooltipModule, 
    MatSelectModule, NgClass, DatePipe,
    MatSnackBarModule, CertificationsListComponent 
  ],
    providers: [ DatePipe ],
  templateUrl: './certifications-page.component.html',
  styleUrl: './certifications-page.component.scss',
})
export class CertificationsPage implements AfterViewInit { 
  
  private certificationsService: CertificationsService = inject(CertificationsService);
  private readonly dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  displayedColumns: string[] = ['title', 'status', 'modality', 'validUntil', 'pdfFile','actions'];
  dataSource = new MatTableDataSource<CompleteCertification>([]); 
  
  totalCertifications = 0;
  isLoading = true;
  isDeleting = false; 
  isUploadingPdf = false; 

  // Armazena TODOS os dados brutos vindos do backend
  private allCertificationsData: CompleteCertification[] = [];
  // Armazena os dados após aplicar filtros e ordenação (mas antes de paginar)
  private filteredAndSortedData: CompleteCertification[] = [];

  availableStatuses = ['Ativa', 'Inativa'];

  filterForm = new FormGroup({
    title: new FormControl<string | null>(''),
    status: new FormControl<string | null>(null),
  });

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('pdfUploadInput') pdfUploadInput!: ElementRef<HTMLInputElement>;
  private uploadTargetCertificationId: string | null = null;
  
  ngAfterViewInit(): void {
    // 1. Escuta filtros e aplica LOCALMENTE (sem chamar backend)
    this.filterForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        if (this.paginator) this.paginator.firstPage();
        this.applyLocalFiltersAndSort();
      });

    // 2. Carga Inicial (Chama backend UMA vez)
    setTimeout(() => {
        this.loadAllCertificationsFromBackend();
    });
  }

  /**
   * ESTRATÉGIA: Busca TUDO do backend (limit alto) para tratar no frontend.
   * Isso resolve o problema de ordenação e filtro inconsistentes.
   */
  loadAllCertificationsFromBackend(): void {
    this.isLoading = true;

    const filters: CertificationFilterDTO = {
      page: 1,
      limit: 1000, // Truque: Pede "tudo" (até 1000) para manipular localmente
      title: undefined, // Traz tudo, filtramos aqui
      status: undefined // Traz tudo, filtramos aqui
    };

    this.certificationsService.findAllCertifications(filters)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response: PaginatedCertificationsResponse) => {
          // Guarda os dados brutos na memória
          this.allCertificationsData = response.data || [];
          
          // Aplica a lógica de UI (filtro, ordem, página)
          this.applyLocalFiltersAndSort();
        },
        error: (err) => {
          console.error('Erro ao carregar certificações', err);
          this.snackBar.open('Erro ao carregar dados.', 'Fechar', { duration: 3000 });
        }
      });
  }

  /**
   * Processa os dados que já estão na memória (allCertificationsData).
   * 1. Filtra
   * 2. Ordena
   * 3. Pagina (Fatia o array)
   */
  applyLocalFiltersAndSort(): void {
    let processedData = [...this.allCertificationsData];

    // 1. FILTRAR
    const titleFilter = this.filterForm.get('title')?.value?.toLowerCase()?.trim();
    const statusFilter = this.filterForm.get('status')?.value; // 'Ativa' | 'Inativa' | null

    if (titleFilter) {
        processedData = processedData.filter(c => c.name.toLowerCase().includes(titleFilter));
    }
    if (statusFilter) {
        const isActiveBool = statusFilter === 'Ativa';
        processedData = processedData.filter(c => c.isActive === isActiveBool);
    }

    // 2. ORDENAR (Sua regra: Ativas topo -> A-Z)
    processedData.sort((a, b) => {
        if (a.isActive !== b.isActive) {
            return a.isActive ? -1 : 1; // Ativos primeiro
        }
        return a.name.localeCompare(b.name); // A-Z
    });

    // Guarda o resultado filtrado para saber o total correto
    this.filteredAndSortedData = processedData;
    this.totalCertifications = processedData.length;

    // 3. PAGINAR (Fatiar o array para exibir só a página atual)
    this.updatePaginatorSlice();
  }

  /**
   * Corta o array baseado no índice e tamanho do paginador
   */
  updatePaginatorSlice(): void {
    if (!this.paginator) return;

    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    const endIndex = startIndex + this.paginator.pageSize;

    // Atualiza a tabela apenas com a fatia atual
    this.dataSource.data = this.filteredAndSortedData.slice(startIndex, endIndex);
  }

  /**
   * Chamado quando o usuário clica na seta ou muda o tamanho da página.
   * NÃO chama o backend, apenas refaz o corte do array.
   */
  onPageChange(event: PageEvent): void {
    this.updatePaginatorSlice();
  }

  private reloadData(): void {
    this.loadAllCertificationsFromBackend();
  }

  resetFilters() {
    this.filterForm.reset({ title: '', status: null });
    // O valueChanges vai disparar applyLocalFiltersAndSort
  }

  // --- MÉTODOS DE AÇÃO (Sem alterações de lógica) ---

  openCertificationDetails(cert: CompleteCertification): void {
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
        if (result) this.reloadData(); 
    });
  }

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
        if (result) this.reloadData(); 
    });
  }
  
  deleteCertification(cert: CompleteCertification): void { 
    const id = typeof cert === 'string' ? cert : cert.id;
    if (confirm('Tem certeza que deseja excluir esta certificação?')) {
        this.isDeleting = true; 
        
        this.certificationsService.deleteCertification(id).pipe(
            finalize(() => this.isDeleting = false)
        ).subscribe({
            next: () => {
                this.snackBar.open('Certificação excluída.', 'OK', { duration: 3000 });
                this.reloadData();
            },
            error: (err) => {
                console.error(err);
                this.snackBar.open('Erro ao excluir.', 'Fechar', { duration: 3000 });
            }
        });
    }
  }

  triggerPdfUpload(certificationId: string): void {
    if (this.isUploadingPdf) return;
    this.uploadTargetCertificationId = certificationId;
    if (this.pdfUploadInput.nativeElement) {
      this.pdfUploadInput.nativeElement.value = '';
    }
    this.pdfUploadInput.nativeElement.click();
  }

  onPdfFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length || !this.uploadTargetCertificationId) return;

    const file = input.files[0];
    const certId = this.uploadTargetCertificationId; 
    
    this.isUploadingPdf = true;
    this.snackBar.open(`Enviando ${file.name}...`, 'Fechar');

    this.certificationsService.uploadCertificationPdf(certId, file).subscribe({
      next: () => {
        this.isUploadingPdf = false;
        this.snackBar.open('PDF atualizado com sucesso!', 'OK', { duration: 3000 });
        this.reloadData();
      },
      error: (err) => {
        console.error("Erro ao enviar PDF:", err);
        this.isUploadingPdf = false;
        this.snackBar.open('Falha ao enviar o PDF.', 'Fechar', { duration: 4000 });
      },
      complete: () => {
        this.uploadTargetCertificationId = null;
      }
    });
  }
}