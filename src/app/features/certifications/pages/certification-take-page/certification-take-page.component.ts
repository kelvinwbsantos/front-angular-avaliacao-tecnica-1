// src/app/pages/certification-take-page/certification-take-page.component.ts
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router'; // Router é necessário
import { MatIconModule } from '@angular/material/icon'; // <-- CORREÇÃO DO ERRO 'mat-icon'
import { MatSnackBar } from '@angular/material/snack-bar';
import { EMPTY, Subscription, forkJoin, of } from 'rxjs';
import { switchMap, catchError, finalize, tap, take } from 'rxjs/operators';

// Serviços
import { LayoutService } from '../../../../core/services/layout.service';
import { CertificationsService } from '../../services/certifications.service';
import { EnrollmentService } from '../../services/enrollment.service';
import { ExamService } from '../../services/exam.service';
import { AuthService } from '../../../../core/services/auth.service';

// Modelos
import { CompleteCertification } from '../../../shared/models/certification.models';
import { Enrollment } from '../../../shared/models/enrollment.model';

// Os dois "Garçons" (as duas Comidas)
import { CertificationTakeModernComponent } from '../../components/certification-take-modern/certification-take-modern.component';
import { CertificationTakeClassicComponent } from '../../components/certification-take-classic/certification-take-classic.component';

@Component({
  selector: 'app-certification-take-page',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule, 
    CertificationTakeModernComponent,
    CertificationTakeClassicComponent
  ],
  templateUrl: './certification-take-page.component.html',
  styleUrls: ['./certification-take-page.component.scss']
})
export class CertificationTakeComponent implements OnInit, OnDestroy {
  
  // --- O "CHEF" (O "Prato") AGORA TEM TODA A LÓGICA ---
  
  // Injeções
  public layoutService = inject(LayoutService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private certificationsService = inject(CertificationsService);
  public authService = inject(AuthService);
  private enrollmentService = inject(EnrollmentService);
  private examService = inject(ExamService); 
  private snackBar = inject(MatSnackBar);

  // Estado
  public certification: CompleteCertification | null = null;
  public isLoading = true;
  public errorLoading = false;
  public certificationId: string | null = null;
  
  public userEnrollmentId: string | null = null;
  public isEnrolling = false;
  public isDownloading = false;

  private loadSubscription: Subscription | null = null;

  ngOnInit(): void {
    // 1. Pega o ID da URL
    this.certificationId = this.route.snapshot.paramMap.get('id');
    if (!this.certificationId) {
      this.errorLoading = true;
      this.isLoading = false;
      return; // O HTML vai mostrar o erro "@else"
    }
    // 2. Carrega os dados
    this.loadCertificationDetails();
  }

  ngOnDestroy(): void {
    this.loadSubscription?.unsubscribe();
  }

  // 3. A LÓGICA DE CARREGAMENTO 
  loadCertificationDetails(): void {
    this.isLoading = true;
    this.errorLoading = false;
    this.certification = null;
    this.userEnrollmentId = null; 
    
    this.loadSubscription = forkJoin({
      certification: this.certificationsService.findCertificationById(this.certificationId!).pipe(
        catchError(err => {
          console.error('[ChefPage] Erro ao buscar certificação:', err);
          this.errorLoading = true;
          return of(null);
        })
      ),
      enrollments: this.enrollmentService.getUserEnrollments().pipe(
        catchError(err => {
          console.warn('[ChefPage] Erro ao buscar matrículas:', err);
          return of([]); 
        })
      )
    }).pipe(
      take(1),
      finalize(() => {
        this.isLoading = false;
        console.log('[ChefPage] Carregamento finalizado.');
      })
    ).subscribe(({ certification, enrollments }) => {
      if (!certification) {
        this.errorLoading = true;
        return; 
      }
      
      this.certification = certification;

      const foundEnrollment = enrollments.find(
        (e: Enrollment) => e.certificationId === this.certificationId && e.status === 'active'
      );
      this.userEnrollmentId = foundEnrollment ? foundEnrollment.id : null;
    });
  }

  // 4. TODAS AS AÇÕES (enroll, unenroll, startExam, download) moram aqui.
  
  enroll(): void {
    if (!this.certificationId) return;
    this.isEnrolling = true; 
    this.enrollmentService.createEnrollment({ certificationId: this.certificationId })
      .pipe(finalize(() => this.isEnrolling = false))
      .subscribe({
        next: (newEnrollment) => {
          this.userEnrollmentId = newEnrollment.id;
          this.snackBar.open('Inscrição realizada com sucesso!', 'Fechar', { duration: 3000 });
        },
        error: (err) => {
          this.snackBar.open('Falha ao realizar inscrição.', 'Fechar', { duration: 3000 });
        }
      });
  }

  unenroll(): void {
    if (!this.userEnrollmentId) return;
    this.isEnrolling = true;
    this.enrollmentService.deleteEnrollment(this.userEnrollmentId)
      .pipe(finalize(() => this.isEnrolling = false))
      .subscribe({
        next: () => {
          this.userEnrollmentId = null;
          this.snackBar.open('Inscrição cancelada.', 'Fechar', { duration: 3000 });
        },
        error: (err) => {
          this.snackBar.open('Falha ao cancelar inscrição.', 'Fechar', { duration: 3000 });
        }
      });
  }

  startExam(): void {
    if (!this.userEnrollmentId) {
      this.snackBar.open('Você precisa estar matriculado para iniciar.', 'Fechar', { duration: 3000 });
      return;
    }
    this.router.navigate(['/app/exam', this.userEnrollmentId]);
  }
  
  scheduleExam(): void {
    alert('Funcionalidade de agendamento ainda não implementada.');
  }

  downloadMaterial(): void {
    // if (!this.certification?.pdfPath || !this.certification.id) {
    //   this.snackBar.open('Material de estudo não disponível.', 'Fechar', { duration: 3000 });
    //   return;
    // }
    // this.isDownloading = true;
    // const certId = this.certification.id;
    // const fileName = this.certification.pdfFileName || 'material_de_estudo.pdf';

    // this.certificationsService.downloadMaterial(certId).pipe(
    //   finalize(() => this.isDownloading = false)
    // ).subscribe({
    //   next: (blob) => {
    //     const url = window.URL.createObjectURL(blob);
    //     const a = document.createElement('a');
    //     document.body.appendChild(a);
    //     a.href = url;
    //     a.download = fileName;
    //     a.click();
    //     window.URL.revokeObjectURL(url);
    //     document.body.removeChild(a);
    //   },
    //   error: (err) => {
    //     this.snackBar.open('Não foi possível baixar o material.', 'Fechar', { duration: 3000 });
    //   }
    // });
  }
}