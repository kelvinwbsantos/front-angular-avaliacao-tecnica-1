// Caminho: src/app/pages/users-page/users-page.ts
// v1.0 - Refatorado de ListUsers/Admin, com AuthService e Permissões

import { Component, inject, ViewChild, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { catchError, debounceTime, map, merge, of,distinctUntilChanged, startWith, switchMap, tap } from 'rxjs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common'; // Necessário para @if/*ngIf
import { MatTooltipModule } from '@angular/material/tooltip'; // Para os tooltips dos botões

// Serviços e Componentes
import { UserService } from './services/user.service'; // Ajuste o caminho
import { AuthService } from '../../services/auth.service'; // Ajuste o caminho
import { UserDetails } from './components/user-details/user-details'; // Ajuste o caminho
import { User } from './models/users-models'; // Ajuste o caminho 
@Component({
  selector: 'app-users', // Atualize o seletor
  standalone: true, // Assumindo standalone
  imports: [
      CommonModule, // Para @if/*ngIf
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
  templateUrl: './users.html', // Renomeado de admin.html
  styleUrl: './users.scss' // Renomeado de admin.scss
})
export class Users implements AfterViewInit { // Renomeado de Admin/ListUsers

  // Injeções
  private userService = inject(UserService); // Usar UserService
  private readonly dialog = inject(MatDialog);
  public readonly authService = inject(AuthService); // Injetar AuthService (público para o template)

  // Propriedades da Tabela e Filtros
  displayedColumns: string[] = ['name', 'email', 'actions']; // Começa básico, pode adicionar mais com *ngIf
  dataSource = new MatTableDataSource<User>([]); // Usar MatTableDataSource
  totalUsers = 0;
  isLoading = true;

  filterForm = new FormGroup({
    name: new FormControl(''),
    email: new FormControl(''),
    cpf: new FormControl('')
  });

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    // Define colunas visíveis baseado em permissões (exemplo)
    setTimeout(() => this.updateDisplayedColumns());

    // Carregamento inicial e reatividade a filtros/pagina
    merge(this.paginator.page, this.filterForm.valueChanges.pipe(debounceTime(400), distinctUntilChanged()))
      .pipe(
        startWith({}),
        tap(() => this.isLoading = true), // Ativa loading no início de cada chamada
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
                     // Mostrar mensagem de erro para o usuário aqui
                     return of({ data: [], total: 0 });
                 }));
        }),
        map(response => {
          this.isLoading = false;
          this.totalUsers = response.total;
          return response.data;
        })
      ).subscribe(data => {
        this.dataSource.data = data; // Atualiza o MatTableDataSource
      });
      
      
  }
  onPageChange(event: PageEvent): void {
      // O merge() no ngAfterViewInit já lida com a mudança de página.
      // Esta função existe apenas para evitar o erro no template.
      // Você PODE adicionar um console.log aqui para depuração, se quiser.
       console.log('Página alterada:', event);
  }
  // Atualiza colunas visíveis (exemplo, pode ser mais complexo)
  updateDisplayedColumns() {
      // Começa com o básico
      const columns = ['name', 'email'];
      // Adiciona coluna de ações se houver PELO MENOS UMA ação permitida
      if (this.authService.hasPermission('EDIT_USER_PROFILE') ||
          this.authService.hasPermission('ASSIGN_USER_ROLES') ||
          this.authService.hasPermission('DELETE_USER')) {
          columns.push('actions');
      }
      this.displayedColumns = columns;
  }

  resetFilters() {
    this.filterForm.reset({ name: '', email: '', cpf: '' });
  }

  export(): void {
      if (!this.authService.hasPermission('EXPORT_USERS')) return; // Defesa

      const filters = this.filterForm.value;
      const exportFilters = {
          name: filters.name || undefined,
          email: filters.email || undefined,
          cpf: filters.cpf || undefined
      };
      this.userService.exportUsers(exportFilters)
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
              error: (err) => { console.error('Erro ao exportar:', err); /* Mostrar erro */ }
          });
  }

  // Abre o modal de detalhes/edição (UserDetails)
  openUserDetails(userId: number): void {
      // Verifica se tem permissão para *ver* detalhes (pode ser READ_USERS ou EDIT_USER_PROFILE)
      if (!this.authService.hasPermission('READ_USERS') && !this.authService.hasPermission('EDIT_USER_PROFILE')) {
           alert("Você não tem permissão para ver detalhes do usuário.");
           return;
      }

      this.dialog.open(UserDetails, {
          width: '900px', // Ajuste conforme necessário
          maxWidth: '95vw',
          data: { userId }, // Passa o ID para o modal buscar os dados completos
      }).afterClosed().subscribe(result => {
          if (result === true) {
              // Recarrega a lista se algo foi alterado no modal
              this.loadDataAfterAction();
          }
      });
  }

  // Abre o modal para CONVIDAR usuário (Implementação futura)
  openInviteModal(): void {
      if (!this.authService.hasPermission('INVITE_USER')) return;
      console.log("Abrir modal de convite...");
      // Ex: this.dialog.open(InviteUserComponent, {...});
      alert("TODO: Implementar modal de convite.");
  }

   // Abre o modal para EDITAR ROLES (Implementação futura)
  openEditRolesModal(user: User): void {
      if (!this.authService.hasPermission('ASSIGN_USER_ROLES')) return;
      console.log("Abrir modal de edição de roles para:", user.name);
      // Ex: this.dialog.open(EditUserRolesComponent, { data: { userId: user.id } });
       alert("TODO: Implementar modal de edição de roles.");
  }

  // Exclui/Desativa um usuário (Implementação futura)
  deleteUser(user: User): void {
      if (!this.authService.hasPermission('DELETE_USER')) return;

      if (confirm(`Tem certeza que deseja excluir/desativar o usuário ${user.name}?`)) {
          console.log("Excluir usuário:", user.id);
          // TODO: Chamar o serviço para deletar
          // this.userService.deleteUser(user.id).subscribe(...)
           alert("TODO: Implementar exclusão de usuário via serviço.");
           // Se sucesso: this.loadDataAfterAction();
      }
  }

  // Helper para recarregar dados após uma ação (criação, edição, exclusão)
  private loadDataAfterAction(): void {
    // Força o switchMap a rodar novamente
    this.filterForm.updateValueAndValidity({ emitEvent: true });
    // Ou uma chamada mais direta se o merge não funcionar como esperado:
    // this.loadUsersBasedOnFiltersAndPage();
  }

  // (Opcional: Função separada para clareza, chamada pelo switchMap)
  // private loadUsersBasedOnFiltersAndPage(): Observable<{ data: User[], total: number }> {
  //    this.isLoading = true;
  //    const filters = this.filterForm.value;
  //    const paramsToSend = { /* ... monta params ... */ };
  //    return this.userService.findAllUsers(paramsToSend)
  //           .pipe(catchError(() => of({ data: [], total: 0 })));
  // }

}