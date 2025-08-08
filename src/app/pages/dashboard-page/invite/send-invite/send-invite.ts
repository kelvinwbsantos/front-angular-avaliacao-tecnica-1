import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { InviteService } from '../../../../services/invites.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-send-invite',
  imports: [MatCardModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatButtonModule],
  templateUrl: './send-invite.html',
  styleUrl: './send-invite.scss'
})
export class SendInvite {
  private invitesService = inject(InviteService);
  userEmail: string | null = null;

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
    if (!this.form.value.newInviteEmail) {
      return;
    }

    this.invitesService.sendInvite({
      email: this.form.value.newInviteEmail!,
      sender: this.userEmail!,
    }).subscribe({
      next: () => {
        console.log('Convite enviado com sucesso!');
        this.form.reset();
      }
    });
  }
}

