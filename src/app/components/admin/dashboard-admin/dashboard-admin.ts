import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth';
import { UsuarioService } from '../../../services/usuario';
import { Usuario } from '../../../models/usuario.model';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [UsuarioService],
  templateUrl: './dashboard-admin.html',
  styleUrls: ['./dashboard-admin.css']
})
export class DashboardAdminComponent implements OnInit {

  seccionActiva: string = 'usuarios';

  // Usuarios
  usuarios: Usuario[] = [];
  nuevoUsuario: Usuario = { id: 0, nombre: '', password: '', tipo: 1 };
  mensajeUsuario: string = '';
  errorUsuario: string = '';
  mostrarFormUsuario: boolean = false;

  // Carga de datos
  archivoCarga: File | null = null;
  resultadoCarga: any = null;
  cargando: boolean = false;

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cambiarSeccion(seccion: string): void {
    this.seccionActiva = seccion;
  }

  // ---- USUARIOS ----
  cargarUsuarios(): void {
    this.usuarioService.listar().subscribe({
      next: (data) => this.usuarios = data,
      error: () => this.errorUsuario = 'Error al cargar usuarios'
    });
  }

  crearUsuario(): void {
    this.mensajeUsuario = '';
    this.errorUsuario = '';
    if (!this.nuevoUsuario.nombre || !this.nuevoUsuario.password) {
      this.errorUsuario = 'Completa todos los campos'; return;
    }
    this.usuarioService.crear(this.nuevoUsuario).subscribe({
      next: () => {
        this.mensajeUsuario = 'Usuario creado correctamente';
        this.nuevoUsuario = { id: 0, nombre: '', password: '', tipo: 1 };
        this.mostrarFormUsuario = false;
        this.cargarUsuarios();
      },
      error: (e) => this.errorUsuario = e.error?.error || 'Error al crear usuario'
    });
  }

  desactivarUsuario(id: number): void {
    if (!confirm('¿Desactivar este usuario?')) return;
    this.usuarioService.desactivar(id).subscribe({
      next: () => this.cargarUsuarios(),
      error: () => this.errorUsuario = 'Error al desactivar usuario'
    });
  }

  getTipoNombre(tipo: number): string {
    if (tipo === 1) return 'Atención al Cliente';
    if (tipo === 2) return 'Operaciones';
    return 'Administrador';
  }

  // ---- CARGA DE DATOS ----
  onArchivoSeleccionado(event: any): void {
    this.archivoCarga = event.target.files[0];
  }

  cargarArchivo(): void {
    if (!this.archivoCarga) return;
    this.cargando = true;
    this.resultadoCarga = null;
    const formData = new FormData();
    formData.append('archivo', this.archivoCarga);
    fetch('/api/carga', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    })
    .then(r => r.json())
    .then(data => {
      this.resultadoCarga = data;
      this.cargando = false;
    })
    .catch(() => this.cargando = false);
  }

  logout(): void {
    this.authService.logout().subscribe();
    this.authService.cerrarSesion();
    this.router.navigate(['/login']);
  }
}