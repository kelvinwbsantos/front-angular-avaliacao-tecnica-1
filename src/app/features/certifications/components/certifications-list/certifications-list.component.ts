// src/app/pages/certifications-page/components/certifications-list/certifications-list.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CompleteCertification } from '../../../shared/models/certification.models';

@Component({
  selector: 'app-certifications-list',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatTableModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './certifications-list.component.html',
  styleUrl: './certifications-list.component.scss'
})
export class CertificationsListComponent {

  // --- O "GARÇOM" (BURRO) SÓ RECEBE DADOS ---
  @Input() dataSource = new MatTableDataSource<CompleteCertification>([]);
  @Input() isLoading = true;
  @Input() isDeleting = false;
  @Input() isUploadingPdf = false;
  @Input() displayedColumns: string[] = [];

  // --- E EMITE EVENTOS ("SININHOS") ---
  @Output() pdfUpload = new EventEmitter<string>();
  @Output() openDetails = new EventEmitter<CompleteCertification>();
  
  // (A lógica de 'loadCertifications' etc. FOI REMOVIDA)
}