import { Routes } from "@angular/router";

export const AUTH_ROUTES: Routes = [
    {
        path: 'login',
        loadComponent: ()=> import('../../features/auth/login/login').then(m => m.LoginComponent),
    },
    {
        path: 'register',
        loadComponent: ()=> import('../../features/auth/register/register').then(m => m.RegisterComponent),
    },
    {
        path: 'forgot-password',
        loadComponent: ()=> import('../../features/auth/forgot-password/forgot-password').then(m => m.ForgotPassword),
    },
    {
        path: 'reset-password/:token',
        loadComponent: ()=> import('../../features/auth/reset-password/reset-password').then(m => m.ResetPassword),
    },
]