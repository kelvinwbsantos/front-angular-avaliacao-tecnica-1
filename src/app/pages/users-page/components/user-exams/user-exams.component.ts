// src/app/components/user-exams/user-exams.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Observable, map } from 'rxjs';

// Imports do Material
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

// Serviços e Modelos (CAMINHO ATUALIZADO)
import { ExamService } from '../../../exam-page/services/exam.service';
import { Exam } from '../../../exam-page/models/exam.model';

@Component({
  selector: 'app-user-exams', // O seletor continua o mesmo
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './user-exams.component.html',
  styleUrls: ['./user-exams.component.scss']
})
export class UserExamsComponent implements OnInit {

  private examService = inject(ExamService);

  // Observables para os dados
  public allCompletedExams$!: Observable<Exam[]>;
  public passedCerts$!: Observable<Exam[]>;

  // Colunas da tabela
  displayedColumns: string[] = ['certificationName', 'completedAt', 'score', 'status'];

  ngOnInit(): void {
    const allExams$ = this.examService.getUserExams();

    this.allCompletedExams$ = allExams$.pipe(
      map(exams => exams.filter(e => e.status === 'completed'))
    );

    this.passedCerts$ = allExams$.pipe(
      map(exams => exams.filter(e => e.passed === true))
    );
  }
}