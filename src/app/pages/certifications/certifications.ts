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
import { catchError, debounceTime, map, merge, of, startWith, switchMap } from 'rxjs';
import { CertificationsService, Certification } from './services/certifications.service';
import { CertificationDetails, CertificationModalData } from './components/certififications-details/certification-details';

@Component({
  selector: 'app-certifications-page',
  standalone: true,
  imports: [
    MatIconModule, MatButtonModule, MatTableModule, MatPaginatorModule, 
    MatCardModule, MatFormFieldModule, MatProgressSpinnerModule, 
    ReactiveFormsModule, MatInputModule, MatDialogModule, MatTooltipModule, 
    MatSelectModule
  ],
  templateUrl: './certifications.html',
  styleUrl: './certifications.scss',
})
export class CertificationsPage implements AfterViewInit {
  private certificationsService = inject(CertificationsService);
  private readonly dialog = inject(MatDialog);

  // Colunas da tabela de Certificações
  displayedColumns: string[] = ['title', 'status', 'questionsCount', 'createdAt', 'actions'];
  dataSource: Certification[] = [];
  totalCertifications = 0;
  isLoading = true;

  // Estados disponíveis para filtro
  availableStatuses = ['Draft', 'Published', 'Pending Review'];

  // Formulário de Filtro adaptado
  filterForm = new FormGroup({
    title: new FormControl(''),
    status: new FormControl(null),
  });

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    // 1. Resetar a página ao aplicar filtros
    this.filterForm.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      // Volta para a primeira página ao alterar o filtro
      if (this.paginator.pageIndex !== 0) {
        this.paginator.pageIndex = 0;
      } else {
        this.loadCertifications(); // Força o reload se já estiver na página 0
      }
    });

    // 2. Mesclar eventos de paginação e filtro
    merge(this.paginator.page, this.filterForm.valueChanges.pipe(debounceTime(300)))
      .pipe(
        startWith({}),
        switchMap(() => this.loadCertifications()),
        map(response => {
          this.isLoading = false;
          this.totalCertifications = response.total;
          return response.data;
        })
      ).subscribe(data => {
        this.dataSource = data;
      });
  }
  
  /**
   * Função auxiliar para carregar as certificações com os filtros atuais.
   */
  loadCertifications() {
    this.isLoading = true;
    const filters = this.filterForm.value;
    
    return this.certificationsService.findAllCertifications({
      page: this.paginator.pageIndex + 1,
      limit: this.paginator.pageSize,
      title: filters.title,
      status: filters.status,
    }).pipe(catchError(() => of({ data: [], total: 0 })));
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
      width: '700px',
      data: data,
    });
  }

  /**
   * Abre o modal para adicionar uma nova certificação.
   */
  addCertification(): void {
    const data: CertificationModalData = { 
      certificationId: null, 
      isCreation: true 
    };
    
    this.dialog.open(CertificationDetails, {
      width: '700px',
      data: data,
    }).afterClosed().subscribe(result => {
        // Recarregar a lista se o modal de criação retornar sucesso (implementação futura)
        if (result) {
            this.paginator.page.emit(); // Força o reload da lista
        }
    });
  }

  resetFilters() {
    this.filterForm.reset({ title: '', status: null });
    // Força o trigger do filtro para recarregar a tabela
    this.paginator.page.emit();
  }
}
