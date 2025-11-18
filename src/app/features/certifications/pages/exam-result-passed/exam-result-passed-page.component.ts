import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider'; // Import do Divider
import { catchError, EMPTY, finalize, tap } from 'rxjs';
import { ExamService } from '../../services/exam.service';
import { ExamResult } from '../../../shared/models/exam.model';

// ****** 1. VERIFIQUE SE ESTE IMPORT ESTÁ CORRETO (SINGULAR) ******
// (Este é o serviço usado no seu método que FUNCIONA)
import { CertificateService } from '../../services/certificate.service'; // Ajuste o caminho se necessário

@Component({
  selector: 'app-exam-result-passed',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatProgressSpinnerModule,
    MatDividerModule // Import do Divider
  ],
  templateUrl: './exam-result-passed-page.component.html',
  styleUrl: './exam-result-passed-page.component.scss'
})
export class ExamResultPassedComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private examService = inject(ExamService);
  private snackBar = inject(MatSnackBar);

  // ****** 2. INJETE O SERVIÇO CORRETO (SINGULAR) ******
  private certificateService = inject(CertificateService);

  isLoading = true;
  isDownloading = false;
  examId: string | null = null;
  certificationId: string | null = null;
  result: ExamResult | null = null;

  ngOnInit(): void {
    this.examId = this.route.snapshot.paramMap.get('examId');
    this.certificationId = this.route.snapshot.paramMap.get('certificationId');

    if (!this.examId) {
      this.isLoading = false;
      // Tratar erro
      return;
    }

    this.examService.getExamResult(this.examId).pipe(
      tap(res => {
        this.result = res;
        this.isLoading = false;
      }),
      catchError(err => {
        this.isLoading = false;
        this.snackBar.open('Erro ao carregar resultado.', 'Fechar', { duration: 3000 });
        return EMPTY;
      })
    ).subscribe();
  }

  // ****** 3. MÉTODO DE DOWNLOAD ATUALIZADO (USANDO A LÓGICA QUE FUNCIONA) ******
 downloadCertificate(): void {
    if (!this.certificationId) {
      console.error("ID da Certificação não encontrado para download.");
      return;
    }

    // Usa o nome do resultado ou um fallback
    const certName = this.result?.certificationName || 'Certificado';
    this.isDownloading = true;

    // Usando a lógica do seu método FUNCIONAL (com subscribe object)
    this.certificateService.generateCertificate(this.certificationId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // Limpa o nome para download (como no seu método funcional)
        a.download = `${certName.replace(/ /g, '_')}_Certificado.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        this.isDownloading = false;
        this.snackBar.open('Download iniciado!', 'Fechar', { duration: 3000 });
      },
      error: (err) => {
        console.error("Erro ao gerar certificado:", err);
        this.isDownloading = false;
        this.snackBar.open('Não foi possível gerar o certificado.', 'Fechar', { duration: 3000 });
      }
    });
  }
}