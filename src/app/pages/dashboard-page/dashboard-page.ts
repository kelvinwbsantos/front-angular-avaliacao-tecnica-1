import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-page',
  imports: [MatButtonModule, MatIconModule, MatSidenavModule, MatToolbarModule, MatMenuModule, RouterLink, RouterModule],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss'
})
export class DashboardPage {
  private snackBar = inject(MatSnackBar);
  readonly authService = inject(AuthService);

  logout() {
    this.authService.logout();
    this.snackBar.open('Sessão encerada com sucesso!', 'Fechar', { duration: 3000 });
  }
}
