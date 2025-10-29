// Caminho: src/app/pages/unauthorized/unauthorized.component.ts
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, RouterLink],
  template: `
    <div class="unauthorized-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Acesso Negado</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Você não tem permissão para acessar esta página.</p>
          <p>Entre em contato com o administrador se acredita que isso é um erro.</p>
        </mat-card-content>
        <mat-card-actions align="end">
          <button mat-raised-button color="primary" routerLink="/app/dashboard">Voltar ao Início</button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 120px); // Ajuste altura conforme layout
      padding: 20px;
    }
    mat-card {
      max-width: 500px;
      text-align: center;
    }
  `]
})
export class UnauthorizedComponent { }