// src/app/pages/certification-take-modern/certification-take-modern.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// Imports do Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CompleteCertification } from '../../../shared/models/certification.models';

@Component({
  selector: 'app-certification-take-classic',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatDividerModule, MatTooltipModule, MatSnackBarModule
  ],
  templateUrl: './certification-take-classic.component.html',
  styleUrls: ['./certification-take-classic.component.scss']
})
export class CertificationTakeClassicComponent { 
  
  // --- O "GARÇOM" (BURRO) SÓ RECEBE DADOS ---
  @Input() certification: CompleteCertification | null = null;
  @Input() isLoading: boolean = true;
  @Input() errorLoading: boolean = false;
  @Input() userEnrollmentId: string | null = null;
  @Input() isEnrolling: boolean = false;
  @Input() isDownloading: boolean = false;

  // --- E EMITE EVENTOS ("SININHOS") ---
  @Output() enroll = new EventEmitter<void>();
  @Output() unenroll = new EventEmitter<void>();
  @Output() startExam = new EventEmitter<void>();
  @Output() scheduleExam = new EventEmitter<void>();
  @Output() downloadMaterial = new EventEmitter<void>();
  @Output() retryLoad = new EventEmitter<void>();

  // (Funções auxiliares que SÓ mexem no visual podem ficar)
  getModalityIcon(modality: string | undefined): string {
    if (!modality) return 'help_outline';
    return modality === 'online' ? 'computer' : 'groups';
  }
}