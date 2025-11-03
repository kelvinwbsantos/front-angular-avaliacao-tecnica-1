// src/app/components/user-exams/user-exams.component.ts
// ESTA É A VERSÃO CORRETA QUE CHAMA O MODAL

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Observable, map, catchError, of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog'; // <-- 1. IMPORT DO DIALOG

// Imports do Material
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

// Serviços e Modelos
import { ExamService } from '../../../exam-page/services/exam.service';
import { Exam } from '../../../exam-page/models/exam.model';
import { CertificateService } from '../../../../core/services/certificate.service'; // 
import { Certificate } from '../../../../core/models/certificate.model';  
// MODAL (caminho de irmão) 
import { ExamResultModalComponent } from '../../../exam-page/components/exam-result/exam-result-modal.component';

@Component({
  selector: 'app-user-exams',
  standalone: true,
  imports: [
    CommonModule, DatePipe, MatCardModule, MatTableModule, MatIconModule,
    MatListModule, MatProgressSpinnerModule, MatTooltipModule, MatDividerModule,
    MatButtonModule, MatMenuModule
  ],
  templateUrl: './user-exams.component.html', // Este .ts bate com o seu .html
  styleUrls: ['./user-exams.component.scss']
})
export class UserExamsComponent implements OnInit {

  // --- Injeções ---
  private examService = inject(ExamService);
  private certificateService = inject(CertificateService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router); 
  private dialog = inject(MatDialog); // <-- 3. INJEÇÃO DO DIALOG

  // --- Estado dos Arrays ---
  public allExams: Exam[] = [];
  public passedCerts: Certificate[] = [];
  
  // --- Estado de Loading ---
  public isLoadingExams = true;
  public isLoadingCerts = true;

  // --- Outros ---
  displayedColumns: string[] = ['certificationName', 'status', 'score', 'completedAt', 'actions'];
  isDownloading = false;

  ngOnInit(): void {
    this.loadUserCertificates();
    this.loadUserExams();
  }

  loadUserCertificates(): void {
    this.isLoadingCerts = true;
    this.certificateService.getUserCertificates().pipe(
      catchError(err => {
        console.error("Falha ao buscar certificados:", err);
        this.snackBar.open('Não foi possível carregar seus certificados.', 'Fechar', { duration: 3000 });
        return of([]); // Retorna um array vazio em caso de erro
      })
    ).subscribe(certificates => {
      this.passedCerts = certificates;
      this.isLoadingCerts = false;
    });
  }

  loadUserExams(): void {
    this.isLoadingExams = true;
    this.examService.getUserExams().pipe(
      catchError(err => {
        console.error("Falha ao buscar histórico de exames:", err);
        this.snackBar.open('Não foi possível carregar seu histórico.', 'Fechar', { duration: 3000 });
        return of([]);
      })
    ).subscribe(exams => {
      this.allExams = exams;
      this.isLoadingExams = false;
    });
  }

  resumeExam(exam: Exam): void {
    this.router.navigate(['/app/exam', exam.enrollmentId]);
  }

  // ****** 4. A FUNÇÃO QUE ABRE O MODAL ******
  openResultModal(exam: Exam): void {
    // Note: Seu HTML tem `(click)="openResultModal(exam.id)"`.
    // Se você passar `exam` (o objeto todo) em vez de `exam.id`, é até melhor.
    // Vou assumir que você passa só o ID por enquanto.
    
    // Se você mudou no HTML para (click)="openResultModal(exam)", use exam.id aqui.
    // Se deixou (click)="openResultModal(exam.id)", a função abaixo está correta.
    
    this.dialog.open(ExamResultModalComponent, {
      width: '500px',
      data: { examId: exam.id }, // Passa o ID para o modal
      autoFocus: false
    });
  }
  
  generateCertificate(certificationId: string, certificationName: string): void {
    this.isDownloading = true;
    this.certificateService.generateCertificate(certificationId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.style.display = 'none';
        a.href = url;
        a.download = `${certificationName.replace(/ /g, '_')}_Certificado.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        this.isDownloading = false;
        this.snackBar.open('Download do certificado iniciado!', 'Fechar', { duration: 3000 });
      },
      error: (err) => {
        console.error("Erro ao gerar PDF:", err);
        this.snackBar.open('Não foi possível gerar o certificado.', 'Fechar', { duration: 3000 });
        this.isDownloading = false;
      }
    });
  }

  shareCertificate(cert: Certificate): void {
    alert(`Compartilhamento social para "${cert.certificationName}" não implementado.`);
  }
}