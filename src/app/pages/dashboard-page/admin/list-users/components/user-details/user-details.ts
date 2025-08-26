import { Component, computed, effect, inject, signal, WritableSignal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { AdminService } from '../../../services/admin-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

export interface RoleOption {
  key: string;
  value: string;
}

@Component({
  selector: 'app-user-details',
  imports: [MatDialogModule, MatCardModule, MatButtonModule, MatInputModule, MatProgressSpinnerModule, MatIconModule, MatSelectModule],
  templateUrl: './user-details.html',
  styleUrl: './user-details.scss'
})
export class UserDetails {
  private readonly data: { userId: string } = inject(MAT_DIALOG_DATA);

  private readonly adminService = inject(AdminService);

  readonly roles: RoleOption[] = [
    { key: 'administrador', value: 'Administrador' },
    { key: 'gente_e_cultura', value: 'Gente e Cultura' },
    { key: 'colaborador', value: 'Colaborador' }
  ];

  readonly user = toSignal(
    this.adminService.findById(this.data.userId)
  );

  readonly userRole = computed(() => this.user()?.role);

  selectedRole: WritableSignal<string | undefined> = signal(undefined);

  readonly hasChanges = computed(() => {
    const originalRole = this.userRole();
    const newRole = this.selectedRole();
    return originalRole && newRole && originalRole !== newRole;
  });

  constructor() {
    effect(() => {
      const currentRoleKey = this.user()?.role;
      if (currentRoleKey) {
        this.selectedRole.set(currentRoleKey);
      }
    });
  }

  onSave() {
    const userId = this.user()?.id;
    const newRole = this.selectedRole();

    if (!userId || !newRole) {
      console.error('Não é possível salvar: Faltam dados do usuário ou da nova role.');
      return;
    }
    
    console.log(`Salvando... Usuário ID: ${userId}, Novo Papel: ${newRole}`);
  }

  generatePassword() {
    
  }
}
