import { Component, effect, inject } from '@angular/core';
import { InviteService } from '../../../../services/invites.service';
import { CommonModule } from '@angular/common';

import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';

interface InviteResponse {
  email: string;
  status: string;
}

@Component({
  selector: 'app-list-invites',
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatChipsModule
  ],
  templateUrl: './list-invites.html',
  styleUrl: './list-invites.scss'
})
export class ListInvites {
  private invitesService = inject(InviteService);

  displayedColumns: string[] = ['email', 'status'];
  invites: InviteResponse[] = [];
  userEmail: string | null = null;

  constructor() {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      this.userEmail = JSON.parse(userDataString).email;
    }

    effect(() => {
      this.invitesService.refreshNeeded();

      this.fetchInvites();
    });
  }

  fetchInvites() {
    if (this.userEmail) {
      this.invitesService.getInvites(this.userEmail).subscribe({
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