import { Component, inject, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminService, User } from '../services/admin-service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { catchError, debounceTime, map, merge, of, startWith, switchMap } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { UserDetails } from './components/user-details/user-details';

@Component({
  selector: 'app-list-users',
  imports: [MatIconModule, MatButtonModule, MatTableModule, MatPaginatorModule, MatCardModule, MatFormFieldModule, MatProgressSpinnerModule, ReactiveFormsModule, MatInputModule],
  templateUrl: './list-users.html',
  styleUrl: './list-users.scss'
})
export class ListUsers {
  private adminService = inject(AdminService);
  private readonly dialog = inject(MatDialog)

  displayedColumns: string[] = ['name', 'email', 'actions'];
  dataSource: User[] = [];
  totalUsers = 0;
  isLoading = true;

  openUserDetails(userId: number): void {
    this.dialog.open(UserDetails, {
      width: '500px',
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '300ms',

      data: { userId },
    });
  }

  filterForm = new FormGroup({
    name: new FormControl(''),
    email: new FormControl(''),
    cpf: new FormControl('')
  });

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    merge(this.paginator.page, this.filterForm.valueChanges.pipe(debounceTime(300)))
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoading = true;
          const filters = this.filterForm.value;
          return this.adminService.findAllUsers({
            page: this.paginator.pageIndex + 1,
            limit: this.paginator.pageSize,
            name: filters.name,
            email: filters.email,
            cpf: filters.cpf
          }).pipe(catchError(() => of({ data: [], total: 0 })));
        }),
        map(response => {
          this.isLoading = false;
          this.totalUsers = response.total;
          return response.data;
        })
      ).subscribe(data => {
        this.dataSource = data;
      });
  }

  resetFilters() {
    this.filterForm.reset();
  }

  export(): void {
    const filters = this.filterForm.value;

    this.adminService.exportUsers({
      name: filters.name ?? undefined,
      email: filters.email ?? undefined,
      cpf: filters.cpf ?? undefined
    })
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `relatorio_usuarios_${new Date().toISOString().split('T')[0]}.xlsx`;
          document.body.appendChild(a);
          a.click();

          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);

        },
        error: (err) => {
          console.error('Erro ao exportar:', err);

        }
      });
  }
}
