import { Routes } from '@angular/router';
import { DashboardPage } from './dashboard-page';
import { roleGuard } from '../../core/guards/role-guard';

export const DASHBOARD_ROUTES: Routes = [
    {
        path: '',
        component: DashboardPage,
        children: [
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
        ]
    }
];