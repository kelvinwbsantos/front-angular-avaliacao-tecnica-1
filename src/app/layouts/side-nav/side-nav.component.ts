// Caminho: src/app/layouts/side-nav/side-nav.component.ts
// v1.2 - Adiciona o link "Minhas Conquistas"

import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { LayoutService } from '../../core/services/layout.service';

interface NavItem {
  link: string;
  label: string;
  icon: string;
  requiredPermission?: string;
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
  public layoutService = inject(LayoutService);

  navItems: NavItem[] = [
    // Início (Dashboard de Métricas)
    { link: '/app/dashboard', label: 'Início', icon: 'home', requiredPermission: 'VIEW_DASHBOARD' },

    // Usuários (Gerencial)
    { link: '/app/users', label: 'Usuários', icon: 'group', requiredPermission: 'READ_USERS' }, 

    // Certificações (Gerencial)
    { link: '/app/certifications', label: 'Certificações', icon: 'assignment_turned_in', requiredPermission: 'READ_CERTIFICATIONS' }, // Mudei o ícone para diferenciar

    // --- Certificações Disponíveis (Candidato) ---
    {
      link: '/app/available-certifications', 
      label: 'Certificações Disponíveis',   
      icon: 'school',                     
      requiredPermission: 'TAKE_CERTIFICATIONS' 
    },

    {// Minhas Conquistas (Candidato)
      link: '/app/achievements', 
      label: 'Minhas Conquistas',
      icon: 'workspace_premium', 
      requiredPermission: 'TAKE_CERTIFICATIONS'
    },
    // Convidar Colaboradores
    { link: '/app/invite', label: 'Convidar', icon: 'person_add', requiredPermission: 'INVITE_USER' }, 

     {
      link: '/app/certificate/verify', // Usamos um caminho genérico para a nova feature
      label: 'Verificar Certificado',  
      icon: 'verified_user', 
      requiredPermission: 'TAKE_CERTIFICATIONS' 
    }
  ];
 

  // Função auxiliar para verificar permissão (sem alteração)
  canView(item: NavItem): boolean {
    if (!item.requiredPermission) {
      return true;
    }
    return this.authService.hasPermission(item.requiredPermission);
  }
}