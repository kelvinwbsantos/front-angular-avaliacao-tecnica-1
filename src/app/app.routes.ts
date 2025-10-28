import { Routes } from '@angular/router';
import { LoginPage } from './pages/login-page/login-page';
import { LandingPage } from './pages/landing-page/landing-page';
import { InvitePage } from './pages/invite-page/invite-page';
import { Expired } from './pages/invite-page/expired/expired';
import { authGuard } from './core/guards/auth-guard'; // Seu guarda de autenticação
import { roleGuard } from './core/guards/role-guard'; // Seu guarda de role (vamos substituir/complementar)
//import { PermissionGuard } from './core/guards/permission.guard'; // Importe o guarda de permissão quando criado

// Importa o novo Layout e a página de Métricas
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { DashboardMetricsComponent } from './pages/dashboard-metrics/dashboard-metrics.component';
//import { Welcome } from './pages/welcome/welcome'; // Assumindo que exista

export const routes: Routes = [
    // Rotas Públicas
    { path: 'login', component: LoginPage, title: 'TechSolutions - Login' },
    { path: '', component: LandingPage }, // Rota raiz pública
    { path: 'invite/expired', component: Expired },
    { path: 'invite/:token', component: InvitePage },

    // Rotas Protegidas
    {
        path: 'app', // Prefixo para rotas autenticadas (ou pode ser '')
        component: MainLayoutComponent,
        canActivate: [authGuard], // Protege todo o layout
        children: [
            // Rota Padrão após login (pode ser welcome ou dashboard)
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // Redireciona /app para /app/dashboard
            // { path: 'welcome', component: Welcome }, // Se tiver uma página de boas-vindas

            // Rota REAL do Dashboard (com métricas)
            {
                path: 'dashboard',
                component: DashboardMetricsComponent,
                //  canActivate: [PermissionGuard], // Proteger com permissão VIEW_DASHBOARD
                //  data: { permissions: ['VIEW_DASHBOARD'] }
            },

            // Rotas dos Módulos/Páginas (Lazy Loaded)
            {
                path: 'users',
                loadChildren: () => import('./pages/users-page/users.routes').then(m => m.USERS_ROUTES),
                // canActivate: [PermissionGuard], // Usar guarda de permissão aqui
                canActivate: [roleGuard], // Manter roleGuard por enquanto
                data: { roles: ['administrador', 'gente_e_cultura'] } // Mudar para permissions depois
                // data: { permissions: ['READ_USERS'] }
            },
            {
                path: 'certifications',
                // Usando loadChildren para consistência (precisa criar certifications.routes.ts)
                loadChildren: () => import('./pages/certifications-page/certifications.routes').then(m => m.CERTIFICATIONS_ROUTES),
                // canActivate: [PermissionGuard],
                canActivate: [roleGuard], // Manter roleGuard por enquanto
                data: { roles: ['administrador', 'gente_e_cultura'] } // Mudar para permissions depois
                // data: { permissions: ['READ_CERTIFICATIONS'] }
            },
            {
                path: 'invite',
                loadChildren: () => import('./pages/invite/invite.routes').then(m => m.INVITE_ROUTES),
                // canActivate: [PermissionGuard],
                canActivate: [roleGuard], // Manter roleGuard por enquanto
                data: { roles: ['administrador', 'gente_e_cultura'] } // Mudar para permissions depois
                // data: { permissions: ['INVITE_USER'] }
            },
            {
                path: 'profile',
                loadChildren: () => import('./pages/profile-page/profile.routes').then(m => m.PROFILE_ROUTES),
                // Geralmente não precisa de guarda específico aqui, só o authGuard do pai
            },
            //outras rotas filhas aqui
        ]
    },

    // Rota Curinga (opcional, redireciona para login ou landing page)
    { path: '**', redirectTo: '' }
];
