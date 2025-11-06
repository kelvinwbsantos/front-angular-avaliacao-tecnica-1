import { Component, inject } from '@angular/core';
import { LoginForm } from "./login-form/login-form";
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [LoginForm],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss'
})
export class LoginPage {
  private router = inject(Router);
  private authService = inject(AuthService);

  ngOnInit() {
    if (this.authService.isLoggedIn()) { // <-- Trocado para isLoggedIn()
      console.log("Login Page: Já logado, redirecionando...");
      // Verifique se a rota '/dashboard' é a correta ou se deve ser '/app/dashboard'
      this.router.navigate(['/app/dashboard']);
    }
  }

}
