import { Routes } from '@angular/router';
import { LoginPage } from './pages/login-page/login-page';
import { LandingPage } from './pages/landing-page/landing-page';
import { InvitePage } from './pages/invite-page/invite-page';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
    { path: 'login', component: LoginPage },
    { path: '', component: LandingPage },
    {
        path: 'dashboard',
        canActivate: [authGuard],
        loadChildren: () => import('./pages/dashboard-page/dashboard.routes')
        .then(m => m.DASHBOARD_ROUTES),
    },
    { path: 'invite/:token', component: InvitePage },
];
