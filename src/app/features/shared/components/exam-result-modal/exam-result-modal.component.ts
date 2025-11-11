// src/app/components/exam-result-modal/exam-result-modal.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Observable, catchError, of, EMPTY } from 'rxjs';

// Imports do Material
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';

// Serviços e Modelos
import { ExamService } from '../../../certifications/services/exam.service';
import { ExamResult } from '../../models/exam.model';

@Component({
  selector: 'app-exam-result-modal',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDividerModule,
    MatListModule
  ],
  templateUrl: './exam-result-modal.component.html',
  styleUrls: ['./exam-result-modal.component.scss']
})
export class ExamResultModalComponent implements OnInit {

  // Injeções
  private examService = inject(ExamService);
  private dialogRef = inject(MatDialogRef<ExamResultModalComponent>);
  public data: { examId: string } = inject(MAT_DIALOG_DATA); // Recebe o ID

  // Estado
  public isLoading = true;
  public result: ExamResult | null = null;
  public error: string | null = null;

  ngOnInit(): void {
    if (!this.data.examId) {
      this.error = "Nenhum ID de exame foi fornecido.";
      this.isLoading = false;
      return;
    }

    // Busca os dados do resultado
    this.examService.getExamResult(this.data.examId).pipe(
      catchError(err => {
        console.error("Erro ao buscar resultado do exame:", err);
        this.error = "Não foi possível carregar o resultado.";
        this.isLoading = false;
        return EMPTY; // Encerra o pipe
      })
    ).subscribe(resultData => {
      this.result = resultData;
      this.isLoading = false;
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}