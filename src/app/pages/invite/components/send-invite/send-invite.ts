import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { InviteService } from '../../services/invites.service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, finalize, tap, throwError } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-send-invite',
  imports: [MatProgressSpinnerModule, MatCardModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatButtonModule],
  templateUrl: './send-invite.html',
  styleUrl: './send-invite.scss'
})
export class SendInvite {
  private readonly invitesService = inject(InviteService);
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  @Output() inviteSent = new EventEmitter<void>();

  readonly loading = signal(false);

  readonly form = this.fb.group({
    newInviteEmail: ['', [Validators.required, Validators.email]]
  });

  sendInvite(): void {
    const { newInviteEmail } = this.form.getRawValue();
    const senderEmail = this.authService.userEmail();

    if (this.form.invalid || !senderEmail || this.loading() || !newInviteEmail) {
      return;
    }

    this.loading.set(true);

    this.invitesService.sendInvite({
      email: newInviteEmail,
      sender: senderEmail,
    }).pipe(
      tap(() => {
        this.snackBar.open('Convite enviado com sucesso!', 'Fechar', { duration: 3000 });
        this.form.reset();
        this.inviteSent.emit();
      }),
      catchError((err) => {
        console.error('Failed to send invite:', err);
        this.snackBar.open(err.error?.message || 'Usuário já convidado', 'Fechar', { duration: 5000 });
        return throwError(() => err);
      }),
      finalize(() => this.loading.set(false))
    ).subscribe();
  }
}

