import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { NgxMaskDirective } from 'ngx-mask';
import { AuthService } from '../../../services/auth.service';


@Component({
  selector: 'app-login-form',
  imports: [NgxMaskDirective, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, ReactiveFormsModule, MatCard],
  templateUrl: './login-form.html',
  styleUrl: './login-form.scss'
})
export class LoginForm {

  private authService = inject(AuthService);

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

      alert(
        `✅ Login realizado com sucesso!\n\n` +
        `📌 CPF enviado: ${cpf}\n` +
        `🔒 Senha enviada: ${password}\n\n` +
        `📥 Resposta do servidor:\n${JSON.stringify(res, null, 2)}`
      );

      if (token) {
        this.authService.storeToken(token);
        // this.router.navigate(['/dashboard']);
      } else {
        alert('⚠️ Token não retornado!');
      }
    },
    error: (err) => {
      console.error(err);
      alert(
        `❌ Erro no login\n\n` +
        `📌 CPF enviado: ${cpf}\n` +
        `🔒 Senha enviada: ${password}\n\n` +
        `🔸 Status: ${err.status}\n` +
        `🔸 Mensagem: ${err.error?.message || 'Erro desconhecido'}\n\n` +
        `📄 Detalhes:\n${JSON.stringify(err, null, 2)}`
      );
    }
  });
}

}




