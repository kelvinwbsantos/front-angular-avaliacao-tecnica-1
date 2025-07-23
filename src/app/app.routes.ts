import { Routes } from '@angular/router';
import { LoginPage } from './pages/login-page/login-page';
import { LandingPage } from './pages/landing-page/landing-page';
import { DashboardPage } from './pages/dashboard-page/dashboard-page';

export const routes: Routes = [
    { path: 'login', component: LoginPage},
    { path: '', component: LandingPage},
    { path: 'dashboard', component: DashboardPage}
];
