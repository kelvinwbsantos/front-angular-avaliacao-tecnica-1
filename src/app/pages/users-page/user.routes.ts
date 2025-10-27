import { Routes } from '@angular/router';
import { Users } from './users';

export const USER_ROUTES: Routes = [
  {
    path: '',
    component: Users,
    title: 'Painel do Usuário'
  },
];