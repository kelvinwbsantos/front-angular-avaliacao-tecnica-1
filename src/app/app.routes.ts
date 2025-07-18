import { Routes } from '@angular/router';
import { LoginPage } from './pages/login-page/login-page';
import { LandingPage } from './pages/landing-page/landing-page';

export const routes: Routes = [
    { path: 'login', component: LoginPage},
    { path: '', component: LandingPage}
];
