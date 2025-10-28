import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list'; // Para o sidenav
import { HeaderComponent } from '../header/header.component'; // Importa o Header
import { SideNavComponent } from '../side-nav/side-nav.component'; // Importa o SideNav
import { AuthService } from '../../core/services/auth.service'; // Para controlar o sidenav

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    MatSidenavModule,
    MatListModule,
    HeaderComponent, // Adiciona o Header aos imports
    SideNavComponent // Adiciona o SideNav aos imports
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  // Flag para controlar se o Sidenav está aberto
  isSidenavOpen = true; // Ou false, como preferir iniciar

  toggleSidenav() {
    this.isSidenavOpen = !this.isSidenavOpen;
  }
}
