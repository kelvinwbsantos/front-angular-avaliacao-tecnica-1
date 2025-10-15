import { Component, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReactiveFormsModule } from '@angular/forms';

// Subindo um nível para acessar o serviço local da page
import { Certification } from '../../services/certifications.service'; 

export interface CertificationModalData {
  certificationId: number | null;
  isCreation: boolean;
  certification?: Certification; // Propriedade opcional
}

@Component({
  selector: 'app-certification-details',
  standalone: true,
  // Adicionando imports para o futuro formulário de upload
  imports: [
    MatDialogTitle, MatDialogContent, MatDialogClose, MatButtonModule, 
    MatIconModule, MatDialogActions, MatCardModule, MatFormFieldModule, 
    MatInputModule, MatSelectModule, MatTooltipModule, ReactiveFormsModule
  ],
  template: `
    <!-- O nome do modal agora reflete a ação -->
    <h2 mat-dialog-title>
      {{ data.isCreation ? 'Adicionar Nova Certificação' : 'Detalhes da Certificação' }}
      @if (!data.isCreation) {
        <span>: {{ data.certification?.title }}</span>
      }
    </h2>
    <mat-dialog-content class="dialog-content">
      
      <!-- Seção de CRIAÇÃO (Card FE-01) -->
      @if (data.isCreation) {
        <div class="creation-panel">
          <div class="upload-area">
            <mat-icon color="primary" style="font-size: 48px; width: 48px; height: 48px;">cloud_upload</mat-icon>
            <p class="text-lg mt-2">Arraste e solte o PDF aqui ou clique para selecionar.</p>
            <!-- Input de arquivo aqui (FE-01) -->
            <button mat-raised-button color="primary" type="button">Selecionar PDF</button>
          </div>

          <mat-card class="mt-4">
            <mat-card-header>
              <mat-card-title>Configurações da Certificação</mat-card-title>
            </mat-card-header>
            <mat-card-content class="config-form">
              <mat-form-field appearance="outline">
                <mat-label>Título da Certificação</mat-label>
                <input matInput>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Descrição</mat-label>
                <textarea matInput></textarea>
              </mat-form-field>
            </mat-card-content>
          </mat-card>
        </div>
      } 
      
      <!-- Seção de DETALHES (Visualização) -->
      @if (!data.isCreation) {
        <!-- CORREÇÃO: Usando o Safe Navigation Operator (?) ou @if para acessar 'certification' -->
        @if (data.certification) {
          <div class="p-4 grid grid-cols-2 gap-4">
            <p><strong>ID:</strong> {{ data.certification.id }}</p>
            <p><strong>Status:</strong> {{ data.certification.status }}</p>
            <p><strong>Questões:</strong> {{ data.certification.questionsCount }}</p>
            <p><strong>Criada em:</strong> {{ data.certification.createdAt }}</p>
            <p class="col-span-2"><strong>Arquivo PDF:</strong> {{ data.certification.pdfFileName }}</p>
            <button mat-flat-button color="accent" class="col-span-2">Ver Questões Geradas</button>
          </div>
        }
      }

    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Cancelar</button>
      <!-- O botão de salvar será habilitado após a geração das questões -->
      <button mat-raised-button color="primary" [mat-dialog-close]="true" *ngIf="data.isCreation">Gerar Questões</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-content { padding: 20px 24px; }
    .upload-area {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      border: 3px dashed var(--mat-sys-primary);
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      background-color: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container);
    }
    .config-form {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding-top: 16px;
    }
    .text-lg { font-size: 1.125rem; }
    .mt-2 { margin-top: 0.5rem; }
  `]
})
export class CertificationDetails {
  constructor(@Inject(MAT_DIALOG_DATA) public data: CertificationModalData) {}
}
