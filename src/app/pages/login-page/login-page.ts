import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-login-page',
  imports: [RouterOutlet, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, ReactiveFormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss'
})
export class LoginPage {
  form = new FormGroup({
    cpf: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/) // formato 000.000.000-00
    ]),
    senha: new FormControl('', [
      Validators.required,
      Validators.minLength(6)
    ])
  });

send() {
  if (this.form.valid) {
    const dados = this.form.value;
    alert(`Dados enviados:\n${JSON.stringify(dados, null, 2)}`);
  } else {
        const dados = this.form.value;
    alert(`Dados enviados:\n${JSON.stringify(dados, null, 2)}`);
  }
}


  hide = signal(true);
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }
}
