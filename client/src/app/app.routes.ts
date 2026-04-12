import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard';
import { Profile } from './features/profile/profile';
import { Products } from './features/products/products';
import { ChangePassword } from './features/change-password/change-password';
import { adminGuard } from './core/guards/admin-guard';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: Products
    },
    {
        path: 'auth',
        loadChildren: () => import('./core/routes/auth.routes').then(m => m.AUTH_ROUTES)
    },
    {
        path: 'admin',
        loadChildren: () => import('./core/routes/admin.routes').then(m => m.ADMIN_ROUTES),
        canActivateChild: [adminGuard]
    },
    {
        path: 'user',
        loadChildren: () => import('./core/routes/user.routes').then(m => m.USER_ROUTES)
    },
    {
        path: 'change-password',
        component: ChangePassword
    },
    {
        path: 'dashboard',
        component: DashboardComponent,
    },
    {
        path: 'profile',
        component: Profile,
        //canActivate: [authGuard]
    },
    {
        path: '**',
        redirectTo: 'dashboard',
    },
];
