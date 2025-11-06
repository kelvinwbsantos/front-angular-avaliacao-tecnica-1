import { Routes } from '@angular/router';
import { Invite } from './pages/invite-page/invite';

export const INVITE_ROUTES: Routes = [
  {
    path: '',
    component: Invite,
    title: 'Painel de Invite'
  },
];