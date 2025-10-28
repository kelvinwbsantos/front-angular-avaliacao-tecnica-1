import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common'; // Para @if

// TODO: Importar serviços para buscar os dados reais
// import { DashboardService } from './services/dashboard.service';

@Component({
  selector: 'app-dashboard-metrics',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './dashboard-metrics.component.html',
  styleUrl: './dashboard-metrics.component.scss'
})
export class DashboardMetricsComponent {
  // Exemplo de dados mockados
  totalUsers = 150;
  newUsersLastWeek = 12;
  pendingInvites = 5;
  activeCertifications = 25;

  // Injetar serviços necessários no construtor
  // constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    // Buscar dados reais da API aqui
    // this.loadDashboardData();
  }

  // loadDashboardData() { ... }
}
