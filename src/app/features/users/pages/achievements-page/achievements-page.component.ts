// src/app/pages/achievements-page/achievements-page.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; 

// Os "Garçons" (da "Praça Central")
import { UserCertificatesListComponent } from '../../components/user-certificates-list/user-certificates-list.component';
import { UserExamsListComponent } from '../../components/user-exams-list/user-exams-list.component';

// O "Chef de Cozinha" (do Bairro "Users")
import { UserService } from '../../services/user.service';

// O "Cozinheiro" (do Bairro "Certifications") - SÓ para a *ação* de download
import { CertificateService } from '../../../certifications/services/certificate.service';

// Modelos (da "Praça Central")
import { Certificate } from '../../../shared/models/certificate.model';
import { Exam } from '../../../shared/models/exam.model';

// O Modal (da "Praça Central")
import { ExamResultModalComponent } from '../../../shared/components/exam-result-modal/exam-result-modal.component';

@Component({
  selector: 'app-achievements-page',
  standalone: true,
  imports: [
    CommonModule, 
    UserCertificatesListComponent,
    UserExamsListComponent,
    MatProgressSpinnerModule
  ],
  templateUrl: './achievements-page.component.html',
  styleUrls: ['./achievements-page.component.scss']
})
export class AchievementsPageComponent implements OnInit {

  // --- Injeções ---
  private userService = inject(UserService); // O "Chef de Cozinha"
  private certificateService = inject(CertificateService); // O "Cozinheiro" (só para download)
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  // --- Estado ---
  public allExams: Exam[] = [];
  public passedCerts: Certificate[] = [];
  public isLoading = true; // Um spinner para a página inteira
  public isDownloading = false; // Estado de download

  ngOnInit(): void {
    this.loadAchievements();
  }

  // O "Chef" (Prato) busca os dados via "Fachada"
  loadAchievements(): void {
    this.isLoading = true;
    this.userService.getUserAchievementsData()
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe(data => {
        // Distribui os dados para os "Garçons"
        console.log('Certificates recebidos pelo AchievementsPageComponent:', data.certificates); 
        this.passedCerts = data.certificates;
        console.log('Exams recebidos pelo AchievementsPageComponent:', data.exams); 
        this.allExams = data.exams;
      });
  }

  // --- AÇÕES (O "Prato" ouve os "sininhos" dos "Garçons") ---

  // Ouvindo o (resumeExam) do Garçom 2
  onResumeExam(exam: Exam): void {
    this.router.navigate(['/app/exam', exam.enrollmentId]);
  }

  // Ouvindo o (openResultModal) do Garçom 2
  onOpenResultModal(exam: Exam): void {
    this.dialog.open(ExamResultModalComponent, {
      width: '500px',
      data: { examId: exam.id }, 
      autoFocus: false
    });
  }

  // Ouvindo o (generateCertificate) do Garçom 1
  onGenerateCertificate(event: {id: string, name: string}): void {
    this.isDownloading = true;
    // O "Prato" chama o "Cozinheiro" diretamente para a *ação*
    this.certificateService.generateCertificate(event.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${event.name.replace(/ /g, '_')}_Certificado.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.isDownloading = false;
        this.snackBar.open('Download iniciado!', 'Fechar', { duration: 3000 });
      },
      error: (err) => {
        this.isDownloading = false;
        this.snackBar.open('Não foi possível gerar o certificado.', 'Fechar', { duration: 3000 });
      }
    });
  }

  // Ouvindo o (shareCertificate) do Garçom 1
  onShareCertificate(cert: Certificate): void {
    alert(`Compartilhamento social para "${cert.certificationName || 'este certificado'}" não implementado.`);
  }
}