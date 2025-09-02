import { Routes } from '@angular/router';
import { DashboardPage } from './dashboard-page';
import { roleGuard } from '../../core/guards/role-guard';
import { Profile } from './profile/profile';
import { Welcome } from './welcome/welcome';

export const DASHBOARD_ROUTES: Routes = [
    {
        path: '',
        component: DashboardPage,
        children: [
            { path: '', component: Welcome },
            {
                path: 'admin',
                loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES),
                canActivate: [roleGuard],
                data: {
                    roles: ['administrador', 'gente_e_cultura']
                }
            },
            {
                path: 'invite',
                loadChildren: () => import('./invite/invite.routes').then(m => m.INVITE_ROUTES),
                canActivate: [roleGuard],
                data: {
                    roles: ['administrador', 'gente_e_cultura']
                }
            },
            {
                path: 'profile',
                loadChildren: () => import('./profile/profile.routes').then(m => m.PROFILE_ROUTES),
            },
        ]
    }
];