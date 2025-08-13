import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { AdminService } from '../../../services/admin-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

export interface GetUserResponse {
  id: number;
  name: string;
  email: string;
  cpf: string
  phonenumber: string;
  cep: string;
  uf: string;
  city: string;
  neighborhood: string;
  street: string;
}

@Component({
  selector: 'app-user-details',
  imports: [MatDialogModule, MatCardModule, MatButtonModule, MatInputModule, MatProgressSpinnerModule, MatIconModule],
  templateUrl: './user-details.html',
  styleUrl: './user-details.scss'
})
export class UserDetails {
  private readonly data: { userId: string } = inject(MAT_DIALOG_DATA);

  private readonly adminService = inject(AdminService);

  readonly user = toSignal(
    this.adminService.findById(this.data.userId)
  );
}
