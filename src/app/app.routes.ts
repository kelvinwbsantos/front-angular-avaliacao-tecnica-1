import { Routes } from '@angular/router';
import { LoginPage } from './pages/login-page/login-page';
import { LandingPage } from './pages/landing-page/landing-page';
import { DashboardPage } from './pages/dashboard-page/dashboard-page';
import { authGuard } from './guards/auth-guard';
import { InvitePage } from './pages/invite-page/invite-page';

export const routes: Routes = [
    { path: 'login', component: LoginPage },
    { path: '', component: LandingPage },
    {
        path: 'dashboard',
        component: DashboardPage,
        canActivate: [authGuard]
    },
    { path: 'invite/:token', component: InvitePage },
];
