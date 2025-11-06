import { Routes } from '@angular/router';
import { UsersPage } from './users-page' // Importa o componente principal da página

export const USERS_ROUTES: Routes = [
  {
    path: '', // Rota padrão para /app/users
    component: UsersPage
    // Não precisa de guardas aqui se a rota pai (/app/users) já tem
  },
  // Adicione rotas filhas específicas de usuários se necessário (ex: /app/users/new)
];
