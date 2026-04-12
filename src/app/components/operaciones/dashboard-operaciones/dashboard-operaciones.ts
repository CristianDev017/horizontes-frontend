import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth';
import { DestinoService } from '../../../services/destino';
import { ProveedorService } from '../../../services/proveedor';
import { PaqueteService } from '../../../services/paquete';
import { Destino } from '../../../models/destino.model';
import { Proveedor } from '../../../models/proveedor.model';
import { Paquete, ServicioPaquete } from '../../../models/paquete.model';

@Component({
  selector: 'app-dashboard-operaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-operaciones.html',
  styleUrl: './dashboard-operaciones.css'
})
export class DashboardOperacionesComponent implements OnInit {

  seccionActiva: string = 'destinos';

  // Destinos
  destinos: Destino[] = [];
  nuevoDestino: Destino = { id: 0, nombre: '', pais: '', descripcion: '', clima: '', imagenUrl: '' };
  mostrarFormDestino: boolean = false;
  editandoDestino: boolean = false;
  mensajeDestino: string = '';
  errorDestino: string = '';

  // Proveedores
  proveedores: Proveedor[] = [];
  nuevoProveedor: Proveedor = { id: 0, nombre: '', tipo: 1, pais: '', contacto: '' };
  mostrarFormProveedor: boolean = false;
  editandoProveedor: boolean = false;
  mensajeProveedor: string = '';
  errorProveedor: string = '';

  // Paquetes
  paquetes: Paquete[] = [];
  nuevoPaquete: Paquete = { id: 0, nombre: '', destinoId: 0, destinoNombre: '', duracionDias: 1, descripcion: '', precioVenta: 0, capacidad: 1, activo: true };
  mostrarFormPaquete: boolean = false;
  editandoPaquete: boolean = false;
  mensajePaquete: string = '';
  errorPaquete: string = '';
  paqueteSeleccionado: Paquete | null = null;

  // Servicios de paquete
  nuevoServicio: ServicioPaquete = { id: 0, paqueteId: 0, proveedorId: 0, proveedorNombre: '', descripcion: '', costo: 0 };
  mostrarFormServicio: boolean = false;
  mensajeServicio: string = '';
  errorServicio: string = '';

  constructor(
    private authService: AuthService,
    private destinoService: DestinoService,
    private proveedorService: ProveedorService,
    private paqueteService: PaqueteService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarDestinos();
    this.cargarProveedores();
    this.cargarPaquetes();
  }

  cambiarSeccion(seccion: string): void {
    this.seccionActiva = seccion;
    this.mensajeDestino = '';
    this.errorDestino = '';
    this.mensajeProveedor = '';
    this.errorProveedor = '';
    this.mensajePaquete = '';
    this.errorPaquete = '';
  }

  // ---- DESTINOS ----
  cargarDestinos(): void {
    this.destinoService.listar().subscribe({
      next: (data) => this.destinos = data,
      error: () => {}
    });
  }

  guardarDestino(): void {
    this.errorDestino = '';
    if (!this.nuevoDestino.nombre || !this.nuevoDestino.pais) {
      this.errorDestino = 'Nombre y país son requeridos'; return;
    }
    const op = this.editandoDestino
      ? this.destinoService.actualizar(this.nuevoDestino.id, this.nuevoDestino)
      : this.destinoService.crear(this.nuevoDestino);
    op.subscribe({
      next: () => {
        this.mensajeDestino = this.editandoDestino ? 'Destino actualizado' : 'Destino creado';
        this.nuevoDestino = { id: 0, nombre: '', pais: '', descripcion: '', clima: '', imagenUrl: '' };
        this.mostrarFormDestino = false;
        this.editandoDestino = false;
        this.cargarDestinos();
        this.cdr.detectChanges();
      },
      error: (e) => this.errorDestino = e.error?.error || 'Error al guardar destino'
    });
  }

  editarDestino(d: Destino): void {
    this.nuevoDestino = { ...d };
    this.editandoDestino = true;
    this.mostrarFormDestino = true;
  }

  eliminarDestino(id: number): void {
    if (!confirm('¿Eliminar este destino?')) return;
    this.destinoService.eliminar(id).subscribe({
      next: () => { this.mensajeDestino = 'Destino eliminado'; this.cargarDestinos(); },
      error: (e) => this.errorDestino = e.error?.error || 'Error al eliminar destino'
    });
  }

  // ---- PROVEEDORES ----
  cargarProveedores(): void {
    this.proveedorService.listar().subscribe({
      next: (data) => this.proveedores = data,
      error: () => {}
    });
  }

  guardarProveedor(): void {
    this.errorProveedor = '';
    if (!this.nuevoProveedor.nombre || !this.nuevoProveedor.pais) {
      this.errorProveedor = 'Nombre y país son requeridos'; return;
    }
    const op = this.editandoProveedor
      ? this.proveedorService.actualizar(this.nuevoProveedor.id, this.nuevoProveedor)
      : this.proveedorService.crear(this.nuevoProveedor);
    op.subscribe({
      next: () => {
        this.mensajeProveedor = this.editandoProveedor ? 'Proveedor actualizado' : 'Proveedor creado';
        this.nuevoProveedor = { id: 0, nombre: '', tipo: 1, pais: '', contacto: '' };
        this.mostrarFormProveedor = false;
        this.editandoProveedor = false;
        this.cargarProveedores();
        this.cdr.detectChanges();
      },
      error: (e) => this.errorProveedor = e.error?.error || 'Error al guardar proveedor'
    });
  }

  editarProveedor(p: Proveedor): void {
    this.nuevoProveedor = { ...p };
    this.editandoProveedor = true;
    this.mostrarFormProveedor = true;
  }

  eliminarProveedor(id: number): void {
    if (!confirm('¿Eliminar este proveedor?')) return;
    this.proveedorService.eliminar(id).subscribe({
      next: () => { this.mensajeProveedor = 'Proveedor eliminado'; this.cargarProveedores(); },
      error: (e) => this.errorProveedor = e.error?.error || 'Error al eliminar proveedor'
    });
  }

  getTipoProveedor(tipo: number): string {
    const tipos: any = { 1: 'Aerolínea', 2: 'Hotel', 3: 'Tour', 4: 'Traslado', 5: 'Otro' };
    return tipos[tipo] || 'Otro';
  }

  // ---- PAQUETES ----
  cargarPaquetes(): void {
    this.paqueteService.listar().subscribe({
      next: (data) => this.paquetes = data,
      error: () => {}
    });
  }

  guardarPaquete(): void {
    this.errorPaquete = '';
    if (!this.nuevoPaquete.nombre || !this.nuevoPaquete.destinoId || this.nuevoPaquete.precioVenta <= 0) {
      this.errorPaquete = 'Completa todos los campos requeridos'; return;
    }
    const op = this.editandoPaquete
      ? this.paqueteService.actualizar(this.nuevoPaquete.id, this.nuevoPaquete)
      : this.paqueteService.crear(this.nuevoPaquete);
    op.subscribe({
      next: () => {
        this.mensajePaquete = this.editandoPaquete ? 'Paquete actualizado' : 'Paquete creado';
        this.nuevoPaquete = { id: 0, nombre: '', destinoId: 0, destinoNombre: '', duracionDias: 1, descripcion: '', precioVenta: 0, capacidad: 1, activo: true };
        this.mostrarFormPaquete = false;
        this.editandoPaquete = false;
        this.cargarPaquetes();
        this.cdr.detectChanges();
      },
      error: (e) => this.errorPaquete = e.error?.error || 'Error al guardar paquete'
    });
  }

  editarPaquete(p: Paquete): void {
    this.nuevoPaquete = { ...p };
    this.editandoPaquete = true;
    this.mostrarFormPaquete = true;
  }

  desactivarPaquete(id: number): void {
    if (!confirm('¿Desactivar este paquete?')) return;
    this.paqueteService.desactivar(id).subscribe({
      next: () => { this.mensajePaquete = 'Paquete desactivado'; this.cargarPaquetes(); },
      error: (e) => this.errorPaquete = e.error?.error || 'Error al desactivar paquete'
    });
  }

  verDetallePaquete(p: Paquete): void {
    this.paqueteService.buscarPorId(p.id).subscribe({
      next: (data) => {
        this.paqueteSeleccionado = data;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  agregarServicio(): void {
    this.errorServicio = '';
    if (!this.nuevoServicio.proveedorId || !this.nuevoServicio.descripcion || this.nuevoServicio.costo <= 0) {
      this.errorServicio = 'Completa todos los campos'; return;
    }
    this.paqueteService.agregarServicio(this.paqueteSeleccionado!.id, this.nuevoServicio).subscribe({
      next: () => {
        this.mensajeServicio = 'Servicio agregado';
        this.nuevoServicio = { id: 0, paqueteId: 0, proveedorId: 0, proveedorNombre: '', descripcion: '', costo: 0 };
        this.mostrarFormServicio = false;
        this.verDetallePaquete(this.paqueteSeleccionado!);
        this.cdr.detectChanges();
      },
      error: (e) => this.errorServicio = e.error?.error || 'Error al agregar servicio'
    });
  }

  getCostoTotal(paquete: Paquete): number {
    if (!paquete.servicios) return 0;
    return paquete.servicios.reduce((sum, s) => sum + s.costo, 0);
  }

  logout(): void {
    this.authService.logout().subscribe();
    this.authService.cerrarSesion();
    this.router.navigate(['/login']);
  }
}