import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-page',
  imports: [MatButtonModule, MatIconModule, MatSidenavModule],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss'
})
export class DashboardPage {
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  logout() {
    localStorage.removeItem('auth_token');
    this.snackBar.open('Sessão encerada com sucesso!', 'Fechar', { duration: 3000 });
    this.router.navigate(['/login']);
  }
}
