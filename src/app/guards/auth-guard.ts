import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }
    const tiposPermitidos = route.data['roles'] as number[];
    if (tiposPermitidos && !tiposPermitidos.includes(this.authService.getTipo())) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}