import { Routes } from '@angular/router';
import { authGuard } from './core/auth-guard';

export const routes: Routes = [
  { 
    path: 'login', 
    loadComponent: () => import('./features/auth/login').then((m) => m.Login) 
  },
  {
    path: 'courses',
    canActivate: [authGuard],
    loadComponent: () => import('./features/courses/courses').then((m) => m.Courses),
  },
  { 
    path: '**', 
    redirectTo: 'courses' 
  },
];
