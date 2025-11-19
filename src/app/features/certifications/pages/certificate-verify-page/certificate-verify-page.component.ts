import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, finalize, of } from 'rxjs';

// Imports locais
import { CertificateService } from '../../services/certificate.service';
import { VerificationResult } from '../../../shared/models/certificate.model';
// import { VerifyFormComponent } from '../../components/verify-form/verify-form.component'; // Componente Filho 1 (Formulário)
// import { VerificationResultComponent } from '../../components/verification-result/verification-result.component'; // Componente Filho 2 (Resultado)

@Component({
  selector: 'app-certificate-verify-page',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule,
    MatFormFieldModule, 
    MatInputModule, 
    MatProgressSpinnerModule,
    MatDividerModule,
    // [Seus Componentes Filhos entrariam aqui]
  ],
  templateUrl: './certificate-verify-page.component.html',
  styleUrl: './certificate-verify-page.component.scss'
})
export class CertificateVerifyPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private certificateService = inject(CertificateService);
  private snackBar = inject(MatSnackBar);

  verificationForm!: FormGroup;
  isLoading = false;
  result: VerificationResult | null = null;
  error: string | null = null;

  ngOnInit(): void {
    this.verificationForm = this.fb.group({
      uuid: ['', [Validators.required, Validators.minLength(36), Validators.maxLength(36)]] // UUID tem 36 caracteres
    });
  }

  verifyCertificate(): void {
    if (this.verificationForm.invalid) {
      this.verificationForm.markAllAsTouched();
      return;
    }

    // Acessamos o valor do formulário diretamente.
    const uuid = this.verificationForm.get('uuid')?.value; 
    if (!uuid) return;

    this.isLoading = true;
    this.error = null;
    this.result = null;

    // A chamada agora está correta (o serviço envia o UUID como query param)
    this.certificateService.verifyCertificate(uuid).pipe( 
      finalize(() => this.isLoading = false),
      catchError(err => {
        console.error("Erro na verificação:", err);
        this.error = err.status === 404 
                     ? "Certificado não encontrado. Verifique o código e tente novamente."
                     : "Falha ao consultar a API de verificação.";
        return of(null);
      })
    ).subscribe(res => {
      if (res) {
        this.result = res;
        this.snackBar.open("Certificado encontrado e validado!", 'OK', { duration: 3000 });
      }
    });
  }
}