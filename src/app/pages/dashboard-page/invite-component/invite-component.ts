import { Component, inject, Input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { InviteService } from '../../../services/invites.service';

interface InviteResponse {
  email: string;
  status: string;
}

@Component({
  selector: 'app-invite-component',
  imports: [MatExpansionModule, MatFormFieldModule, MatInputModule, MatButtonModule, ReactiveFormsModule],
  templateUrl: './invite-component.html',
  styleUrl: './invite-component.scss',
})
export class InviteComponent {

  private invitesService = inject(InviteService);

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  })

  readonly panelOpenState = signal(false);

  @Input() senderEmail: string | undefined;

  inviteButton() {
    if (this.form.invalid) {
      console.error('The form is invalid. Please check the email address.');
      return;
    }

    if (!this.senderEmail) {
      console.error('Sender email is not available.');
      return;
    }

    this.invitesService.sendInvite({
      email: this.form.value.email!,
      sender: this.senderEmail!,
    }).subscribe({
      next: () => {
        console.log('Convite enviado com sucesso!');
        this.form.reset();
      }
    });
  }

  // implementar signals
  invites: InviteResponse[] = [];

  ngOnInit() {
    this.fetchInvites();
  }

  fetchInvites() {
    if (this.senderEmail) {
      this.invitesService.getInvites(this.senderEmail).subscribe({
        next: (data) => {
          this.invites = data.map(invite => ({
            email: invite.email,
            status: invite.status
          }));
        },
        error: (error) => {
          console.error('Error fetching invites:', error);
        }
      });
    }
  }
}
