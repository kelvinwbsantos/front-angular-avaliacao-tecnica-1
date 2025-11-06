// Caminho: src/app/pages/users-page/users.ts
// v1.1 - Torna authService explicitamente público para o template

import { Component, inject, ViewChild, AfterViewInit, OnInit } from '@angular/core'; // Adicionado OnInit
// ... (outros imports de Angular, Material, RxJS)
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
// ... (imports de Serviços, Componentes, Models)
import { UserService } from '../../services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
//import { User } from './users-page';
import { UserDetails } from '../../components/user-details/user-details';
import { CommonModule } from '@angular/common'; // Necessário para ngIf
// ... outros imports de módulos standalone ...
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { catchError, debounceTime, distinctUntilChanged, map, merge, of, startWith, switchMap, tap } from 'rxjs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { User } from '../../../shared/models/users.models';
@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [
      CommonModule,
      ReactiveFormsModule,
      MatCardModule,
      MatFormFieldModule,
      MatInputModule,
      MatProgressSpinnerModule,
      MatTableModule,
      MatPaginatorModule,
      MatButtonModule,
      MatIconModule,
      MatTooltipModule
    ],
  templateUrl: './users-page.html',
  styleUrl: './users-page.scss'
})
export class UsersPage implements AfterViewInit, OnInit { // Adicionado OnInit

  // Injeções
  private userService = inject(UserService);
  private readonly dialog = inject(MatDialog);

  // CORREÇÃO: Declarar explicitamente como public
  public readonly authService = inject(AuthService);

  // Propriedades da Tabela e Filtros
  displayedColumns: string[] = ['name', 'email', 'actions'];
  dataSource = new MatTableDataSource<User>([]);
  totalUsers = 0;
  isLoading = true;

  filterForm = new FormGroup({
    name: new FormControl(''),
    email: new FormControl(''),
    cpf: new FormControl('')
  });

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Adiciona ngOnInit para segurança, embora updateDisplayedColumns seja chamado depois
  ngOnInit(): void {
      // Pode fazer alguma inicialização aqui se necessário
  }


  ngAfterViewInit() {
    // Adia a atualização das colunas
    setTimeout(() => this.updateDisplayedColumns());

    // Carregamento inicial e reatividade a filtros/pagina
    merge(this.paginator.page, this.filterForm.valueChanges.pipe(debounceTime(400), distinctUntilChanged()))
      .pipe(
          startWith({}),
          tap(() => this.isLoading = true),
          switchMap(() => {
              const filters = this.filterForm.value;
              const paramsToSend = {
                  page: this.paginator ? this.paginator.pageIndex + 1 : 1,
                  limit: this.paginator ? this.paginator.pageSize : 10,
                  name: filters.name || undefined,
                  email: filters.email || undefined,
                  cpf: filters.cpf || undefined
              };
              return this.userService.findAllUsers(paramsToSend)
                     .pipe(catchError((err) => {
                         console.error("Erro ao buscar usuários:", err);
                         // TODO: Mostrar mensagem de erro para o usuário
                         return of({ data: [], total: 0 });
                     }));
          }),
          map(response => {
              this.isLoading = false;
              this.totalUsers = response.total;
              return response.data;
          })
      ).subscribe(data => {
          this.dataSource.data = data;
      });
  }

  updateDisplayedColumns() {
      const columns = ['name', 'email'];
      if (this.authService.hasPermission('EDIT_USER_PROFILE') ||
          this.authService.hasPermission('ASSIGN_USER_ROLES') ||
          this.authService.hasPermission('DELETE_USER')) {
          columns.push('actions');
      }
      this.displayedColumns = columns;
      console.log("Colunas atualizadas:", this.displayedColumns); // Log para depurar
  }

  resetFilters() {
    this.filterForm.reset({ name: '', email: '', cpf: '' });
  }

  export(): void {
      if (!this.authService.hasPermission('EXPORT_USERS')) return;
      const filters = this.filterForm.value;
      const exportFilters = { /* ... */ };
      this.userService.exportUsers(exportFilters).subscribe({ /* ... */ });
  }

  openUserDetails(userId: number): void {
      if (!this.authService.hasPermission('READ_USERS') && !this.authService.hasPermission('EDIT_USER_PROFILE')) {
           alert("Você não tem permissão para ver detalhes do usuário.");
           return;
      }
      this.dialog.open(UserDetails, { /* ... */ }).afterClosed().subscribe(result => { /* ... */ });
  }

  openInviteModal(): void {
      if (!this.authService.hasPermission('INVITE_USER')) return;
      alert("TODO: Implementar modal de convite.");
  }

  openEditRolesModal(user: User): void {
      if (!this.authService.hasPermission('ASSIGN_USER_ROLES')) return;
       alert("TODO: Implementar modal de edição de roles.");
  }

  deleteUser(user: User): void {
      if (!this.authService.hasPermission('DELETE_USER')) return;
      if (confirm(`Tem certeza...?`)) {
           alert("TODO: Implementar exclusão de usuário via serviço.");
      }
  }

  // ADICIONADO: Método onPageChange (pode estar vazio por enquanto)
  onPageChange(event: PageEvent): void {
      // O merge() já lida com isso, mas o método precisa existir
      console.log('Página alterada (evento capturado):', event);
  }


  private loadDataAfterAction(): void {
    // Força o switchMap a rodar novamente (uma forma simples)
    // Uma abordagem melhor seria ter uma função loadUsers() separada
    this.filterForm.updateValueAndValidity({ emitEvent: true });
  }
}