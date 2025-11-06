import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxMaskDirective } from 'ngx-mask';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-invite-page',
  imports: [
    MatCardModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    NgxMaskDirective,
    MatProgressSpinnerModule
  ],
  templateUrl: './invite-details.component.html',
  styleUrl: './invite-details.component.scss'
})
export class InvitePage {

  private route = inject(ActivatedRoute);
  private router = inject(Router)
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  // Forms
  form = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.maxLength(100),
    ]),
    email: new FormControl('', [
    ]),
    cpf: new FormControl('', [
      Validators.required,
      Validators.maxLength(14),
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'),
    ]),
    phonenumber: new FormControl('', [
      Validators.maxLength(20),
    ]),
    cep: new FormControl('', [
      Validators.required,
      Validators.maxLength(9),
    ]),
    uf: new FormControl('', [
      Validators.required,
      Validators.maxLength(2),
    ]),
    localidade: new FormControl('', [
      Validators.required,
      Validators.maxLength(30),
    ]),
    bairro: new FormControl('', [
      Validators.required,
      Validators.maxLength(40),
    ]),
    logradouro: new FormControl('', [
      Validators.required,
      Validators.maxLength(100),
    ])
  });

  token: string = '';


  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token') ?? '';

    this.http.get<any>(`http://localhost:3000/invites/validate?token=${this.token}`).subscribe({
      next: (res) => {
        this.form.patchValue({ email: res.email });
        this.form.get('email')?.disable();
      },
      error: (err) => {
        console.error(err);
        this.router.navigate(['/invite/expired']);
      }
    });

    this.form.get('cep')?.valueChanges.subscribe((cep) => {
      if (cep?.length === 9) {
        this.form.get('uf')?.disable();
        this.form.get('localidade')?.disable();
        this.form.get('bairro')?.disable();
        this.form.get('logradouro')?.disable();

        this.http.get<any>(`https://viacep.com.br/ws/${cep}/json/`).subscribe({
          next: (data) => {
            if (!data.erro) {
              this.form.patchValue({
                uf: data.uf,
                localidade: data.localidade,
                bairro: data.bairro,
                logradouro: data.logradouro,
              });
            }
          },
        });
      } else {
        this.form.patchValue({
          uf: '',
          localidade: '',
          bairro: '',
          logradouro: '',
        });
        this.form.get('uf')?.enable();
        this.form.get('localidade')?.enable();
        this.form.get('bairro')?.enable();
        this.form.get('logradouro')?.enable();
      }
    });

  }

  // ...
  submitForm() {
    if (this.form.valid) {
      const rawValue = this.form.getRawValue();

      const registrationData = {
        token: this.token,
        name: rawValue.name ?? '',
        email: rawValue.email ?? '',
        cpf: rawValue.cpf ?? '',
        password: rawValue.password ?? '',
        phonenumber: rawValue.phonenumber ?? '',
        cep: rawValue.cep ?? '',
        uf: rawValue.uf ?? '',
        city: rawValue.localidade ?? '',
        neighborhood: rawValue.bairro ?? '',
        street: rawValue.logradouro ?? ''
      };

      alert('Dados a serem enviados:\n' + JSON.stringify(registrationData, null, 2));

      this.authService.register(registrationData).subscribe({
        next: (response) => {
          console.log('Registro realizado com sucesso!', response);
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Erro no registro:', err);
          alert('Erro ao registrar. Por favor, verifique seus dados.');
        }
      });
    } else {
      alert('Formulário inválido. Verifique os campos obrigatórios.');
    }
  }

}
