import { Routes } from '@angular/router';
import { authGuard } from './core/auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register').then((m) => m.Register),
  },
  {
    path: 'courses',
    canActivate: [authGuard],
    loadComponent: () => import('./features/courses/courses').then((m) => m.Courses),
  },
  {
    path: 'courses/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/courses/course-detail').then((m) => m.CourseDetail),
  },
  {
    path: 'tags',
    canActivate: [authGuard],
    loadComponent: () => import('./features/tags/tags').then((m) => m.Tags),
  },
  {
    path: '**',
    redirectTo: 'courses',
  },
];
