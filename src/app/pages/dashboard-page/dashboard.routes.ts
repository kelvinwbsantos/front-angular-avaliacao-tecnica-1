import { Routes } from '@angular/router';
import { DashboardPage } from './dashboard-page';
import { roleGuard } from '../../core/guards/role-guard';
import { Profile } from '../profile-page/profile';
import { Welcome } from '../welcome/welcome';
import { CertificationsPage } from '../certifications-page/certifications'; 


export const DASHBOARD_ROUTES: Routes = [
    {
        path: '',
        component: DashboardPage,
        children: [
            { path: '', component: Welcome },
            {
                path: 'users',
                loadChildren: () => import('../users-page/user.routes').then(m => m.USER_ROUTES),
                canActivate: [roleGuard],
                data: {
                    roles: ['administrador', 'gente_e_cultura']
                }
            },
            {
                path: 'invite',
                loadChildren: () => import('../invite/invite.routes').then(m => m.INVITE_ROUTES),
                canActivate: [roleGuard],
                data: {
                    roles: ['administrador', 'gente_e_cultura']
                }
            },
            {
                path: 'profile',
                loadChildren: () => import('../profile-page/profile.routes').then(m => m.PROFILE_ROUTES),
            },
            // NOVO ITEM: Rota para Certificações
             {
                 path: 'certifications',
                 component: CertificationsPage
             }
        ]
    }
];