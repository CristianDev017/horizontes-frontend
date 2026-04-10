import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {

  nombre: string = '';
  password: string = '';
  error: string = '';
  cargando: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  login(): void {
    if (!this.nombre || !this.password) {
      this.error = 'Ingresa tu usuario y contraseña'; return;
    }
    this.cargando = true;
    this.error = '';

    this.authService.login(this.nombre, this.password).subscribe({
      next: (usuario: Usuario) => {
        this.authService.setUsuario(usuario);
        this.cargando = false;
        if (usuario.tipo === 3) this.router.navigate(['/admin']);
        else if (usuario.tipo === 1) this.router.navigate(['/atencion']);
        else if (usuario.tipo === 2) this.router.navigate(['/operaciones']);
      },
      error: () => {
        this.error = 'Usuario o contraseña incorrectos';
        this.cargando = false;
      }
    });
  }
}