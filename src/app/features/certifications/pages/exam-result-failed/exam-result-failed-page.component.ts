import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, EMPTY, tap } from 'rxjs';
import { ExamService } from '../../services/exam.service';
import { ExamResult } from '../../../shared/models/exam.model';
import { MatDividerModule } from '@angular/material/divider'; // Import do Divider

@Component({
  selector: 'app-exam-result-failed',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule,
     MatButtonModule, MatIconModule, MatDividerModule, MatProgressSpinnerModule],
  templateUrl: './exam-result-failed-page.component.html',
  styleUrl: './exam-result-failed-page.component.scss' 
})
export class ExamResultFailedComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private examService = inject(ExamService);
  private snackBar = inject(MatSnackBar);

  isLoading = true;
  examId: string | null = null;
  certificationId: string | null = null;
  result: ExamResult | null = null;

  ngOnInit(): void {
    this.examId = this.route.snapshot.paramMap.get('examId');
    this.certificationId = this.route.snapshot.paramMap.get('certificationId');

    if (!this.examId) {
      this.isLoading = false;
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
}