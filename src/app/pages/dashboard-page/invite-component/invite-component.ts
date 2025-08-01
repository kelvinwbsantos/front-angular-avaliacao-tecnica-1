import { HttpClient } from '@angular/common/http';
import { Component, inject, Input, signal } from '@angular/core';
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

  private http = inject(HttpClient);

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  })

  readonly panelOpenState = signal(false);

  @Input() payload: any;

  // payload preciso do email


  inviteButton() {
    const email = this.form.get('email')?.value;

    // implementar requisicao

    this.form.reset();
    this.form.get('email')?.enable();
  }
}
