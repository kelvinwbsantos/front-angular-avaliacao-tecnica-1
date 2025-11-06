import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { InviteService } from '../../services/invites.service';
import { AuthService } from '../../../../core/services/auth.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

interface InviteResponse {
  invites: {
    email: string;
    status: string;
    createdAt: Date;
    expiresAt: Date;
  }[];
  total: number;
}

@Component({
  selector: 'app-list-invites',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  providers: [DatePipe],
  templateUrl: './list-invites.html',
  styleUrls: ['./list-invites.scss']
})
export class ListInvites implements OnInit {
  private readonly invitesService = inject(InviteService);
  private readonly authService = inject(AuthService);

  filterForm = new FormGroup({
    email: new FormControl(''),
    status: new FormControl(''),
  });

  userEmail: string | undefined

  displayedColumns: string[] = ['email', 'status', 'createdAt', 'expiresAt'];
  dataSource = new MatTableDataSource<InviteResponse['invites'][0]>();

  isLoading = true;
  totalInvites = 0;

  pageSize = 10;
  pageIndex = 0;

  constructor() {
    this.userEmail = this.authService.userEmail();

    effect(() => {
      this.invitesService.refreshNeeded();
      this.fetchInvites();
    });
  }

  ngOnInit(): void {
    this.fetchInvites();
  }

  fetchInvites(): void {
    if (!this.userEmail) {
      console.error("User email not found, cannot fetch invites.");
      this.isLoading = false;
      return;
    }

    this.isLoading = true;

    const emailFilter = this.filterForm.get('email')?.value || '';
    const statusFilter = this.filterForm.get('status')?.value || '';

    this.invitesService.getInvites(this.userEmail, emailFilter, statusFilter, this.pageIndex + 1, this.pageSize).subscribe({
      next: (response: InviteResponse) => {
        this.dataSource.data = response.invites;
        this.totalInvites = response.total;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching invites:', error);
        this.isLoading = false;
        this.dataSource.data = [];
      }
    });
  }

  handlePageEvent(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchInvites();
  }

  clearFilters(): void {
    this.filterForm.reset();

    this.fetchInvites();
  }

  getIconForStatus(status: string): string {
    switch (status.toLowerCase()) {
      case 'em aberto':
        return 'hourglass_empty';
      case 'finalizado':
        return 'check_circle';
      case 'vencido':
        return 'error';
      default:
        return 'help';
    }
  }
}