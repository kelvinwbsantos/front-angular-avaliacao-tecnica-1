import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { NgxMaskDirective } from 'ngx-mask';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-login-form',
  imports: [NgxMaskDirective, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, ReactiveFormsModule, MatCard],
  templateUrl: './login-form.html',
  styleUrl: './login-form.scss'
})
export class LoginForm {

  private authService = inject(AuthService);
  private route = inject(Router);
  private snackBar = inject(MatSnackBar);

  form = new FormGroup({
    cpf: new FormControl('', [
      Validators.required,
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')
    ])
  });

  hide = signal(true);
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  send() {
    if (this.form.invalid) return;

    const { cpf, password } = this.form.value;

    this.authService.login({ cpf: cpf!, password: password! }).subscribe({
      next: (res) => {
        const token = res.access_token;
        const email = res.email;

        if (token) {
          this.authService.handleLoginSuccess(token);
          this.route.navigate(['/dashboard']);
          this.snackBar.open('Login realizado com sucesso!', 'Fechar', { duration: 3000 });
        }
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open(
          `${err.error?.message || 'Erro desconhecido'}`,
          'Fechar',
          { duration: 5000 }
        );
      }
    });
  }


}




