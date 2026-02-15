import { Routes } from '@angular/router';
import { authGuard } from 'app/core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () => import('@layouts/auth-layout/auth-layout.component').then(m => m.AuthLayout),
    children: [
      { 
        path: 'login', 
        loadComponent: () => import('@features/pages/auth/login/login.component').then(m => m.Login),
      },
      {      
        path: 'register', 
        loadComponent: () => import('@features/pages/auth/register/register.component').then(m => m.Register)
      },
      {      
        path: 'reset', 
        loadComponent: () => import('@features/pages/auth/reset/reset.component').then(m => m.ResetPassword)
      } 
    ],
  },
  {
    path: '',
    loadComponent: () => import('@layouts/main-layout/main-layout.component').then(m => m.MainLayout),
    children: [
      {
        path: 'home',
        loadComponent: () => import('@features/pages/home/home.component').then(m => m.Home)
      },
      {
        path: 'tools',
        canMatch: [authGuard],
        loadComponent: () => import('@features/pages/tools/tools.component').then(m => m.Tools)
      },
      {
        path: 'front',
        canMatch: [],
        loadComponent: () => import('@features/pages/front/front.component').then(m => m.Front)
      },
      {
        path: 'admin',
        canMatch: [authGuard],
        loadComponent: () => import('@features/pages/admin/shell/admin.component').then(m => m.Admin),
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'users' },
          {
            path: 'users',
            loadComponent: () => import('@features/pages/admin/users/admin-users.component').then(m => m.AdminUsersComponent)
          },
          {
            path: 'tools',
            loadComponent: () => import('@features/pages/admin/tools/admin-tools.component').then(m => m.AdminToolsComponent)
          },
          {
            path: 'tool-types',
            loadComponent: () => import('@features/pages/admin/tool-types/admin-tool-types.component').then(m => m.AdminToolTypesComponent)
          },
          {
            path: 'stacks',
            loadComponent: () => import('@features/pages/admin/stacks/admin-stacks.component').then(m => m.AdminStacksComponent)
          },
          {
            path: 'stack-types',
            loadComponent: () => import('@features/pages/admin/stack-types/admin-stack-types.component').then(m => m.AdminStackTypesComponent)
          },
          {
            path: 'audit-logs',
            loadComponent: () => import('@features/pages/admin/audit-logs/admin-audit-logs.component').then(m => m.AdminAuditLogsComponent)
          }
        ]
      }
    ]
  },
  { path: '**', redirectTo: 'home' }
];
