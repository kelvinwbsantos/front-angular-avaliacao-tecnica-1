import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-invite-component',
  imports: [MatExpansionModule, MatFormFieldModule, MatInputModule, MatButtonModule, ReactiveFormsModule],
  templateUrl: './invite-component.html',
  styleUrl: './invite-component.scss',
})
export class InviteComponent {
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  })

  // chamar serviço do backend para mandar email

  readonly panelOpenState = signal(false);
}
