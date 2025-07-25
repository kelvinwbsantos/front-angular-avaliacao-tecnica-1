import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { InviteComponent } from "./invite-component/invite-component";

@Component({
  selector: 'app-dashboard-page',
  imports: [MatButtonModule, MatIconModule, MatSidenavModule, InviteComponent],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss'
})
export class DashboardPage {
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);

  readonly payload = this.authService.getDecodedToken();

  logout() {
    this.authService.logout();
    this.snackBar.open('Sessão encerada com sucesso!', 'Fechar', { duration: 3000 });
    this.router.navigate(['/login']);
  }
}
