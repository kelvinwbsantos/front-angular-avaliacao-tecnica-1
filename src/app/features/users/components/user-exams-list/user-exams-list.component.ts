// src/app/feature/users/components/user-exams-list/user-exams-list.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core'; // <-- MUDANÇA (sem OnInit, inject)
import { CommonModule, DatePipe } from '@angular/common';

// Imports do Material
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';

// Modelos
import { Exam } from '../../../shared/models/exam.model'; 

@Component({
  selector: 'app-user-exams-list',
  standalone: true,
  imports: [
    CommonModule, DatePipe, MatCardModule, MatTableModule, MatIconModule,
    MatProgressSpinnerModule, MatTooltipModule, MatButtonModule
  ],
  templateUrl: './user-exams-list.component.html',
  styleUrl: './user-exams-list.component.scss'
})
export class UserExamsListComponent { // <-- Remove OnInit

  @Input() allExams: Exam[] = [];
  @Input() isLoadingExams = true;
  
  @Output() resumeExam = new EventEmitter<Exam>();
  @Output() openResultModal = new EventEmitter<Exam>();

    
  displayedColumns: string[] = ['certificationName', 'status', 'score', 'completedAt', 'actions'];

  
}