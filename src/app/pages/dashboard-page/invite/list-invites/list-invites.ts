import { Component, OnInit, ViewChild, inject, AfterViewInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { InviteService } from '../../../../services/invites.service';
import { AuthService } from '../../../../core/services/auth.service';

interface InviteResponse {
  invites: {
    email: string;
    status: string;
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
    MatChipsModule
  ],
  templateUrl: './list-invites.html',
  styleUrls: ['./list-invites.scss']
})
export class ListInvites implements OnInit {
  private readonly invitesService = inject(InviteService);
  private readonly authService = inject(AuthService);

  userEmail: string | undefined

  displayedColumns: string[] = ['email', 'status'];
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
    
    this.invitesService.getInvites(this.userEmail, this.pageIndex + 1, this.pageSize).subscribe({
      next: (response: InviteResponse) => {
        this.dataSource.data = response.invites; // Assign the paginated data
        this.totalInvites = response.total; // Use the total from the API response
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

  getStatusColor(status: string): 'primary' | 'accent' | 'warn' {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'primary';
      case 'completed':
        return 'accent';
      case 'expired':
        return 'warn';
      default:
        return 'primary';
    }
  }
}