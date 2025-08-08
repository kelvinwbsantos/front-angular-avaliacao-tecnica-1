import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { InviteService } from '../../../../services/invites.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-send-invite',
  imports: [MatProgressSpinnerModule, MatCardModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatButtonModule],
  templateUrl: './send-invite.html',
  styleUrl: './send-invite.scss'
})
export class SendInvite {
  private invitesService = inject(InviteService);
  userEmail: string | null = null;

  private snackBar = inject(MatSnackBar);
  public loading = false;

  constructor() {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      this.userEmail = JSON.parse(userDataString).email;
    }
  }

  form = new FormGroup({
    newInviteEmail: new FormControl('', [Validators.required, Validators.email])
  })

  sendInvite() {
    if (this.form.invalid || !this.userEmail || this.loading) {
      return;
    }

    this.loading = true;

    this.invitesService.sendInvite({
      email: this.form.value.newInviteEmail!,
      sender: this.userEmail!,
    }).pipe(
        finalize(() => this.loading = false)
      ).subscribe({
        next: () => {
          this.snackBar.open('Convite enviado com sucesso!', 'Fechar', { duration: 3000 });
          this.form.reset();
        },
        error: (err) => {
          console.error('Failed to send invite:', err);
          this.snackBar.open('Falha ao enviar o convite', 'Fechar', { duration: 5000 });
        }
    });
  }
}

