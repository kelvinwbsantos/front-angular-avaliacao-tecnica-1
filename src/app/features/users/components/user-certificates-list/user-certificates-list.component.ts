// src/app/shared/components/user-certificates-list/user-certificates-list.component.ts
import { Component, Input, Output, EventEmitter, inject } from '@angular/core'; 
import { CommonModule, DatePipe } from '@angular/common';
// Imports do Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
//Acoplamento Legal
import { Certificate } from '../../../shared/models/certificate.model';

@Component({
  selector: 'app-user-certificates-list',
  standalone: true,
  imports: [
    CommonModule, DatePipe, MatCardModule, MatIconModule, MatListModule, 
    MatProgressSpinnerModule, MatTooltipModule, MatDividerModule, 
    MatButtonModule, MatMenuModule
  ],
  templateUrl: './user-certificates-list.component.html',
  styleUrl: './user-certificates-list.component.scss'
})
export class UserCertificatesListComponent { // <-- Remove OnInit

  // O "Garçom" é "burro". Ele só recebe dados.
  @Input() passedCerts: Certificate[] = [];
  @Input() isLoadingCerts = true;
  @Input() isDownloading = false;

  // E "toca sininhos" (emite eventos) para o "Prato"
  @Output() generateCertificate = new EventEmitter<{id: string, name: string}>();
  @Output() shareCertificate = new EventEmitter<Certificate>();
  
  
  // (Ações que disparam os sininhos)
  onGenerateCertificate(cert: Certificate): void {
    this.generateCertificate.emit({
      id: cert.id, 
      name: cert.certification?.name || 'Certificado'
    });
  }

  onShareCertificate(cert: Certificate): void {
    this.shareCertificate.emit(cert);
  }
}