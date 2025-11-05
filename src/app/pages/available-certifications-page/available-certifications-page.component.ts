
import { CertificationsCardGridModernComponent } from '../certifications-page/components/certifications-card-grid-modern/certifications-card-grid-modern.component'; // Garçom A
import { CertificationsCardGridClassicComponent } from '../certifications-page/components/certifications-card-grid-classic/certifications-card-grid-classic.component'; // Garçom B
// src/app/pages/available-certifications-page/available-certifications-page.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EMPTY, catchError, finalize } from 'rxjs'; 
import { LayoutService } from '../../layouts/services/layout.service';
import { CertificationsService } from '../certifications-page/services/certifications.service';
import { Certification } from '../certifications-page/models/certification-models';

// Importa os dois "Garçons" (layouts)

@Component({
  selector: 'app-available-certifications-page',
  standalone: true,
  imports: [
    CommonModule, 
    CertificationsCardGridModernComponent, 
    CertificationsCardGridClassicComponent  
  ],
  templateUrl: './available-certifications-page.component.html',
  styleUrls: ['./available-certifications-page.component.scss']
})
export class AvailableCertificationsPageComponent implements OnInit { 
  
  public layoutService = inject(LayoutService);
  private certificationsService = inject(CertificationsService);

  public certifications: Certification[] = [];
  public isLoading = true;
  public errorLoading = false;

  ngOnInit(): void {
    console.log('[Chef] ngOnInit: Começando a carregar...');
    this.loadCertifications();
  }

  loadCertifications(): void {
    this.isLoading = true;
    this.errorLoading = false;
    console.log('[Chef] loadCertifications: Chamando a API...');
    
    this.certificationsService
      .findAllCertifications({ 
          page: 1, 
          limit: 100, 
          
          // ************ O TESTE ESTÁ AQUI ************
          // Trocamos 'true' (que trava) por 'null' (que funciona no Admin)
          isActive: null 
          // ******************************************
      }) 
      .pipe(
        catchError((err) => {
          console.error('[Chef] ERRO na API:', err);
          this.errorLoading = true;
          return EMPTY;
        }),
        finalize(() => {
          // Esta linha SÓ vai rodar se a API responder
          console.log('[Chef] FINALIZE: A chamada terminou. isLoading = false');
          this.isLoading = false; 
        })
      )
      .subscribe((response) => {
        console.log('[Chef] SUCESSO na API: Dados recebidos.');
        // Filtramos no frontend (temporariamente)
        this.certifications = response.data.filter(cert => cert.isActive);
      });
  }
}