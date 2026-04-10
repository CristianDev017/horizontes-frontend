import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { DashboardAdminComponent } from './components/admin/dashboard-admin/dashboard-admin';
import { DashboardAtencionComponent } from './components/atencion/dashboard-atencion/dashboard-atencion';
import { DashboardOperacionesComponent } from './components/operaciones/dashboard-operaciones/dashboard-operaciones';
import { AuthGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'admin',
    component: DashboardAdminComponent,
    canActivate: [AuthGuard],
    data: { roles: [3] }
  },
  {
    path: 'atencion',
    component: DashboardAtencionComponent,
    canActivate: [AuthGuard],
    data: { roles: [1, 3] }
  },
  {
    path: 'operaciones',
    component: DashboardOperacionesComponent,
    canActivate: [AuthGuard],
    data: { roles: [2, 3] }
  },
  { path: '**', redirectTo: 'login' }
];