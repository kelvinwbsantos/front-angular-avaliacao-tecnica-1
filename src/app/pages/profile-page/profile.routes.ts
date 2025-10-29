import { Routes } from '@angular/router';
import { ProfileComponent } from './profile-page';

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    component: ProfileComponent,
    title: 'Meu Perfil'
  },
];