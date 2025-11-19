// Caminho: src/app/pages/users-page/users.ts
// v1.1 - Torna authService explicitamente público para o template

import { Component, inject, ViewChild, AfterViewInit, OnInit } from '@angular/core'; // Adicionado OnInit
// ... (outros imports de Angular, Material, RxJS)
import { FormControl, FormGroup, ReactiveFormsModule, FormBuilder } from '@angular/forms';
// ... (imports de Serviços, Componentes, Models)
import { UserService } from '../../services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
//import { User } from './users-page';
import { UserDetailsModalComponent,UserModalData } from '../../components/user-details/user-details-modal.component';
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
import { catchError, debounceTime, distinctUntilChanged, map, merge, of, startWith, switchMap, tap, finalize } from 'rxjs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { User } from '../../../shared/models/users.models';
import { UsersListComponent } from '../../components/users-list/users-list.component';
import { MatSnackBar } from '@angular/material/snack-bar';

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
      UsersListComponent,
      MatTooltipModule
    ],
  templateUrl: './users-page.html',
  styleUrl: './users-page.scss'
})
export class UsersPage implements  OnInit { // Adicionado OnInit

  // Injeções
  private userService = inject(UserService);
  private readonly dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  // CORREÇÃO: Declarar explicitamente como public
  public readonly authService = inject(AuthService);
private fb = inject(FormBuilder);
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
    this.filterForm = this.fb.group({
      name: [''],
      email: [''],
      cpf: ['']
    });

    // Carrega a lista inicial
    this.loadUsers();
  }
  openAddUserModal(): void {
      const data: UserModalData = {
        userId: null, 
        isCreation: true 
    };

    const dialogRef = this.dialog.open(UserDetailsModalComponent, {
      width: '600px',
      maxWidth: '95vw',
      data: data,
    });

    // Se a criação for bem-sucedida, recarrega a lista
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.loadUsers(); 
        this.snackBar.open('Usuário criado com sucesso!', 'OK', { duration: 3000 });
      }
    });
  }

  /**
   * Busca os usuários usando o serviço, aplicando filtros e paginação.
   */
  loadUsers(): void {
    this.isLoading = true;

    // Prepara os filtros combinando paginação e formulário
    const filters = {
      page: this.paginator ? this.paginator.pageIndex + 1 : 1,
      limit: this.paginator ? this.paginator.pageSize : 10,
      ...this.filterForm.value // pega name, email, cpf do form
    };

    this.userService.findAllUsers(filters)
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response) => {
          // Ajuste conforme o retorno do seu backend. 
          // Geralmente é { data: User[], total: number } ou { items: [], meta: {} }
          this.dataSource.data = response.data || response; 
          
          // Se o backend retornar o total para paginação:
          this.totalUsers = response.total || response.length; 
        },
        error: (err) => {
          console.error('Erro ao listar usuários:', err);
          this.snackBar.open('Não foi possível carregar a lista de usuários.', 'Fechar', { duration: 3000 });
        }
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

 /**
   * 1. LÓGICA DO BOTÃO EDITAR
   * Recebe o ID do evento (viewDetails) da lista e abre o modal
   */
  openUserDetails(userId: number): void {
    const dialogRef = this.dialog.open(UserDetailsModalComponent, {
      width: '600px',
      maxWidth: '95vw',
      data: { 
        userId: userId, 
        isCreation: false // Importante: avisa que é edição
      }
    });

    // Quando o modal fecha, se retornou 'true', recarrega a lista
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.loadUsers(); 
        this.snackBar.open('Usuário atualizado com sucesso!', 'OK', { duration: 3000 });
      }
    });
  }

  /**
   * 2. LÓGICA DO BOTÃO EXCLUIR
   * Recebe o objeto User do evento (deleteUser) da lista
   */
  deleteUser(user: User): void {
    // A confirmação fica aqui no Pai (Smart Component)
    if (!confirm(`Tem certeza que deseja excluir o usuário "${user.name}"?`)) {
      return;
    }

    this.isLoading = true; // Liga o spinner da tabela

    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open('Usuário excluído com sucesso.', 'OK', { duration: 3000 });
        this.loadUsers(); // Recarrega a tabela para sumir com a linha
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.snackBar.open('Não foi possível excluir o usuário.', 'Fechar', { duration: 3000 });
      }
    });
  }

  openInviteModal(): void {
      if (!this.authService.hasPermission('INVITE_USER')) return;
      alert("TODO: Implementar modal de convite.");
  }

  openEditRolesModal(user: User): void {
      if (!this.authService.hasPermission('ASSIGN_USER_ROLES')) return;
       alert("TODO: Implementar modal de edição de roles.");
  }

 
  // ADICIONADO: Método onPageChange (pode estar vazio por enquanto)
  onPageChange(event: PageEvent): void {
      // O merge() já lida com isso, mas o método precisa existir
      this.loadUsers();
  }


  private loadDataAfterAction(): void {
    // Força o switchMap a rodar novamente (uma forma simples)
    // Uma abordagem melhor seria ter uma função loadUsers() separada
    this.filterForm.updateValueAndValidity({ emitEvent: true });
  }
}