import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('@layouts/main-layout/main-layout.component').then(m => m.MainLayout),
    children: [
      {
        path: 'home',
        loadComponent: () => import('@features/pages/home/home.component')
          .then(m => m.Home)
      }
    ]
  },
  { path: '**', redirectTo: 'home' }
];
