// Caminho: src/app/layouts/side-nav/side-nav.component.ts
// v1.1 - Atualiza navItems com base no menu antigo e usa hasPermission

import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service'; 

interface NavItem {
  link: string;
  label: string;
  icon: string;
  requiredPermission?: string; // Permissões (mockadas por enquanto)
  // requiredRoles?: string[]; // Alternativa se ainda não migrou para permissões
}

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatListModule,
    MatIconModule
  ],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.scss'
})
export class SideNavComponent {
  public authService = inject(AuthService);

  // Define os itens de navegação com base no menu antigo e permissões
  navItems: NavItem[] = [
    // Início (Dashboard de Métricas) - Assumindo permissão VIEW_DASHBOARD
    { link: '/app/dashboard', label: 'Início', icon: 'home', requiredPermission: 'VIEW_DASHBOARD' },

    // Usuários (Gerencial) - Usando permissão READ_USERS
    { link: '/app/users', label: 'Usuários', icon: 'group', requiredPermission: 'READ_USERS' }, // Ícone atualizado

    // Certificações - Usando permissão READ_CERTIFICATIONS
    { link: '/app/certifications', label: 'Certificações', icon: 'workspace_premium', requiredPermission: 'READ_CERTIFICATIONS' },

    // --- Certificações Disponíveis ---
    {
        link: '/app/available-certifications', // Rota do candidato
        label: 'Certificações Disponíveis',    // Nome do link no menu
        icon: 'school',                       // Ícone (pode escolher outro)
        requiredPermission: 'TAKE_CERTIFICATIONS' // Permissão que você mockou!
    },

    // Convidar Colaboradores - Usando permissão INVITE_USER
    { link: '/app/invite', label: 'Convidar', icon: 'person_add', requiredPermission: 'INVITE_USER' }, // Ícone atualizado

    // Perfil e Logout foram movidos para o HeaderComponent
  ];

  // Função auxiliar para verificar permissão (opcional, mas limpa o HTML)
  canView(item: NavItem): boolean {
    if (!item.requiredPermission) {
      return true; // Item público (se houver)
    }
    return this.authService.hasPermission(item.requiredPermission);
  }
}