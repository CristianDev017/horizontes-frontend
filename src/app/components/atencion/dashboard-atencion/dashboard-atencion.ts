import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth';
import { ClienteService } from '../../../services/cliente';
import { PaqueteService } from '../../../services/paquete';
import { ReservacionService } from '../../../services/reservacion';
import { PagoService } from '../../../services/pago';
import { Cliente } from '../../../models/cliente.model';
import { Paquete } from '../../../models/paquete.model';
import { Reservacion } from '../../../models/reservacion.model';
import { Pago } from '../../../models/pago.model';


@Component({
  selector: 'app-dashboard-atencion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-atencion.html',
  styleUrl: './dashboard-atencion.css'
})
export class DashboardAtencionComponent implements OnInit {

  seccionActiva: string = 'reservaciones-dia';
  usuario: any;

  // Clientes
  clienteBuscado: Cliente | null = null;
  dpiBusqueda: string = '';
  mostrarFormCliente: boolean = false;
  isEditarCliente: boolean = false;
  clienteOriginalDpi: string = '';
  nuevoCliente: Cliente = { dpi: '', nombre: '', fechaNac: '', telefono: '', email: '', nacionalidad: '' };
  mensajeCliente: string = '';
  errorCliente: string = '';

  // Reservaciones
  reservacionesDelDia: Reservacion[] = [];
  reservacionSeleccionada: Reservacion | null = null;
  historialCliente: Reservacion[] = [];
  paquetes: Paquete[] = [];
  nuevaReservacion: any = { paqueteId: 0, fechaViaje: '', pasajeros: [] };
  dpiBuscandoPasajero: string = '';
  mensajeReservacion: string = '';
  errorReservacion: string = '';
  ocupadosActuales: number = 0;

  // Pagos
  pagosReservacion: Pago[] = [];
  nuevoPago: any = { reservacionId: 0, monto: 0, metodo: 1, fecha: '' };
  mensajePago: string = '';
  errorPago: string = '';
  mostrarFormPago: boolean = false;

  // Cancelacion
  mensajeCancelacion: string = '';
  errorCancelacion: string = '';
  cancelacionInfo: { fecha: string; montoReembolso: number; perdidaAgencia: number } | null = null;

  constructor(
    private authService: AuthService,
    private clienteService: ClienteService,
    private paqueteService: PaqueteService,
    private reservacionService: ReservacionService,
    private pagoService: PagoService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.usuario = this.authService.getUsuario();
    this.cargarReservacionesDelDia();
    this.cargarPaquetes();
  }

  cambiarSeccion(seccion: string): void {
    this.seccionActiva = seccion;
    this.mensajeCliente = '';
    this.errorCliente = '';
    this.mensajeReservacion = '';
    this.errorReservacion = '';
  }

  // ---- CLIENTES ----
  buscarCliente(): void {
    this.errorCliente = '';
    this.mensajeCliente = '';
    this.clienteBuscado = null;
    this.historialCliente = [];
    this.isEditarCliente = false;
    if (!this.dpiBusqueda) { this.errorCliente = 'Ingresa un DPI'; return; }
    this.clienteService.buscarPorDpi(this.dpiBusqueda).subscribe({
      next: (c) => {
        this.clienteBuscado = c;
        this.clienteOriginalDpi = c.dpi;
        this.cargarHistorial(c.dpi);
        this.cdr.detectChanges();
      },
      error: () => {
        this.clienteBuscado = null;
        this.mostrarFormCliente = true;
        this.isEditarCliente = false;
        this.nuevoCliente = { dpi: this.dpiBusqueda, nombre: '', fechaNac: '', telefono: '', email: '', nacionalidad: '' };
        this.cdr.detectChanges();
      }
    });
  }

  cargarHistorial(dpi: string): void {
    this.reservacionService.historialCliente(dpi).subscribe({
      next: (data) => this.historialCliente = data,
      error: () => {}
    });
  }

  editarCliente(): void {
    if (!this.clienteBuscado) return;
    this.mostrarFormCliente = true;
    this.isEditarCliente = true;
    this.clienteOriginalDpi = this.clienteBuscado.dpi;
    this.nuevoCliente = { ...this.clienteBuscado };
    this.errorCliente = '';
    this.mensajeCliente = '';
  }

  registrarCliente(): void {
    this.errorCliente = '';
    if (!this.nuevoCliente.dpi || !this.nuevoCliente.nombre || !this.nuevoCliente.fechaNac) {
      this.errorCliente = 'Completa los campos requeridos'; return;
    }

    if (this.isEditarCliente) {
      this.clienteService.actualizar(this.clienteOriginalDpi, this.nuevoCliente).subscribe({
        next: (c) => {
          this.clienteBuscado = c;
          this.mostrarFormCliente = false;
          this.isEditarCliente = false;
          this.mensajeCliente = 'Cliente actualizado correctamente';
          this.cdr.detectChanges();
        },
        error: (e) => {
          this.errorCliente = e.error?.error || 'Error al actualizar cliente';
          this.mostrarFormCliente = true;
          this.cdr.detectChanges();
        }
      });
      return;
    }

    this.clienteService.buscarPorDpi(this.nuevoCliente.dpi).subscribe({
      next: () => {
        this.errorCliente = 'Ya existe un cliente con ese DPI';
        this.mostrarFormCliente = true;
        this.cdr.detectChanges();
      },
      error: () => {
        this.clienteService.crear(this.nuevoCliente).subscribe({
          next: (c) => {
            this.clienteBuscado = c;
            this.mostrarFormCliente = false;
            this.mensajeCliente = 'Cliente registrado correctamente';
            this.cdr.detectChanges();
          },
          error: (e) => {
            this.errorCliente = e.error?.error || 'Error al registrar cliente';
            this.mostrarFormCliente = true;
            this.cdr.detectChanges();
          }
        });
      }
    });
  }

  // ---- RESERVACIONES ----
  cargarReservacionesDelDia(): void {
    this.reservacionService.listarDelDia().subscribe({
      next: (data) => this.reservacionesDelDia = data,
      error: () => {}
    });
  }

  cargarPaquetes(): void {
    this.paqueteService.listar().subscribe({
      next: (data) => this.paquetes = data.filter(p => p.activo),
      error: () => {}
    });
  }

  seleccionarReservacion(r: Reservacion): void {
    this.reservacionSeleccionada = null;
    this.mensajePago = '';
    this.errorPago = '';
    this.mensajeCancelacion = '';
    this.errorCancelacion = '';
    this.cancelacionInfo = null;
    this.mostrarFormPago = false;
    this.nuevoPago = { reservacionId: r.id, monto: 0, metodo: 1, fecha: '' };

    this.reservacionService.buscarPorId(r.id).subscribe({
      next: (detalle) => {
        this.reservacionSeleccionada = detalle;
        this.cargarPagos(detalle.id);
        this.cdr.detectChanges();
      },
      error: () => {
        this.reservacionSeleccionada = r;
        this.cargarPagos(r.id);
        this.cdr.detectChanges();
      }
    });
  }

agregarPasajero(): void {
  if (!this.dpiBuscandoPasajero) return;

  if (this.nuevaReservacion.pasajeros.includes(this.dpiBuscandoPasajero)) {
    this.errorReservacion = 'Este pasajero ya está agregado'; return;
  }

  const paquete = this.getPaqueteSeleccionado();
  if (!paquete) { this.errorReservacion = 'Selecciona un paquete primero'; return; }
  if (!this.nuevaReservacion.fechaViaje) { this.errorReservacion = 'Selecciona una fecha de viaje primero'; return; }

  if (this.nuevaReservacion.pasajeros.length + 1 > paquete.capacidad) {
    this.errorReservacion = `Este paquete ya está lleno (capacidad: ${paquete.capacidad})`; return;
  }

  this.clienteService.buscarPorDpi(this.dpiBuscandoPasajero).subscribe({
    next: () => {
      this.nuevaReservacion.pasajeros.push(this.dpiBuscandoPasajero);
      this.dpiBuscandoPasajero = '';
      this.errorReservacion = '';
      this.cdr.detectChanges();
    },
    error: () => this.errorReservacion = 'Cliente no encontrado con ese DPI'
  });
}

  quitarPasajero(dpi: string): void {
    this.nuevaReservacion.pasajeros = this.nuevaReservacion.pasajeros.filter((d: string) => d !== dpi);
  }

  crearReservacion(): void {
    this.errorReservacion = '';
    this.mensajeReservacion = '';

    if (!this.nuevaReservacion.paqueteId || !this.nuevaReservacion.fechaViaje) {
      this.errorReservacion = 'Selecciona paquete y fecha de viaje';
      return;
    }

    if (this.nuevaReservacion.pasajeros.length === 0) {
      this.errorReservacion = 'Agrega al menos un pasajero';
      return;
    }

    const paquete = this.paquetes.find(p => p.id == this.nuevaReservacion.paqueteId);

    const data = {
      paqueteId: Number(this.nuevaReservacion.paqueteId),
      agenteId: this.usuario.id,
      fechaViaje: this.formatearFecha(this.nuevaReservacion.fechaViaje),
      costoTotal: paquete ? paquete.precioVenta * this.nuevaReservacion.pasajeros.length : 0,
      pasajeros: this.nuevaReservacion.pasajeros
    };

    this.reservacionService.crear(data).subscribe({
      next: (r) => {
        this.mensajeReservacion = `Reservacion ${r.numero} creada correctamente`;
        this.cdr.detectChanges();

        this.cargarReservacionesDelDia();

        setTimeout(() => {
          this.mensajeReservacion = '';
          this.nuevaReservacion = { paqueteId: 0, fechaViaje: '', pasajeros: [] };
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (e) => {
        this.errorReservacion = e.error?.error || 'Error al crear reservacion';
      }
    });
  }

  getPorcentajeOcupacionConPasajeros(): number {
  const paq = this.getPaqueteSeleccionado();
  if (!paq || !paq.capacidad) return 0;
  return Math.round((this.nuevaReservacion.pasajeros.length * 100) / paq.capacidad);
}

estaLleno(): boolean {
  const paq = this.getPaqueteSeleccionado();
  if (!paq) return false;
  return this.nuevaReservacion.pasajeros.length >= paq.capacidad;
}

  // ---- PAGOS ----
  cargarPagos(reservacionId: number): void {
    this.pagoService.listarPorReservacion(reservacionId).subscribe({
      next: (data) => this.pagosReservacion = data,
      error: () => {}
    });
  }

  isPagoCompleto(): boolean {
    if (!this.reservacionSeleccionada) return false;
    return this.getSaldoRestante() === 0;
  }

  getEstadoReal(): string {
    if (!this.reservacionSeleccionada) return '';
    if (this.reservacionSeleccionada.estado === 'CONFIRMADA' && !this.isPagoCompleto()) {
      return 'PENDIENTE';
    }
    return this.reservacionSeleccionada.estado;
  }

  registrarPago(): void {
    this.errorPago = '';
    this.mensajePago = '';
    if (!this.reservacionSeleccionada) {
      this.errorPago = 'Selecciona una reservación primero';
      return;
    }

    const monto = Number(this.nuevoPago.monto);
    const metodo = Number(this.nuevoPago.metodo);
    const saldoRestante = this.getSaldoRestante();

    if (isNaN(monto) || monto <= 0) {
      this.errorPago = 'El monto debe ser mayor a 0';
      return;
    }

    if (monto > saldoRestante) {
      this.errorPago = `El monto no puede ser mayor al saldo restante (Q.${saldoRestante.toFixed(2)})`;
      return;
    }

    const pago = {
      reservacionId: this.reservacionSeleccionada.id,
      monto,
      metodo,
      fecha: this.formatearFecha(new Date().toISOString().split('T')[0])
    };

    this.pagoService.registrar(pago).subscribe({
      next: (resp) => {
        this.mensajePago = resp.mensaje;
        this.mostrarFormPago = false;
        this.errorPago = '';
        this.nuevoPago = { reservacionId: this.reservacionSeleccionada!.id, monto: 0, metodo: 1, fecha: '' };
        this.cargarPagos(this.reservacionSeleccionada!.id);
        if (this.reservacionSeleccionada && this.isPagoCompleto()) {
          this.reservacionSeleccionada.estado = 'CONFIRMADA';
        }
        this.cargarReservacionesDelDia();
        this.cdr.detectChanges();
      },
      error: (e) => this.errorPago = e.error?.error || 'Error al registrar pago'
    });
  }

  // ---- CANCELACION ----
  procesarCancelacion(): void {
    this.errorCancelacion = '';
    if (!this.reservacionSeleccionada) {
      this.errorCancelacion = 'Selecciona una reservación antes de cancelar';
      return;
    }

    if (this.reservacionSeleccionada.estado !== 'CONFIRMADA' || !this.isPagoCompleto()) {
      this.errorCancelacion = 'Solo se puede cancelar una reservación CONFIRMADA con pago completo';
      return;
    }

    const diasAntes = this.getDiasAntesViaje();
    if (diasAntes <= 0) {
      this.errorCancelacion = 'No se puede cancelar el mismo día del viaje o después';
      return;
    }

    if (!confirm('¿Seguro que deseas cancelar esta reservación?')) return;

    const totalPagado = this.getTotalPagado();
    const porcentajeReembolso = this.getPorcentajeReembolso();
    const montoReembolso = Number((totalPagado * porcentajeReembolso).toFixed(2));
    const perdidaAgencia = Number((totalPagado - montoReembolso).toFixed(2));

    const payload = {
      reservacionId: this.reservacionSeleccionada.id,
      fecha: this.formatearFecha(new Date().toISOString().split('T')[0]),
      montoReembolso,
      perdidaAgencia
    };

    this.http.post<any>('/api/cancelaciones', payload).subscribe({
      next: (data) => {
        if (data.error) {
          this.errorCancelacion = data.error;
        } else {
          this.reservacionSeleccionada!.estado = 'CANCELADA';
          this.cancelacionInfo = {
            fecha: payload.fecha,
            montoReembolso,
            perdidaAgencia
          };
          this.mensajeCancelacion = `Cancelación procesada. Reembolso: Q.${montoReembolso} / Pérdida agencia: Q.${perdidaAgencia}`;
          this.cargarReservacionesDelDia();
          this.cdr.detectChanges();
        }
      },
      error: (e) => {
        this.errorCancelacion = e.error?.error || 'No se puede cancelar esta reservación';
        this.cdr.detectChanges();
      }
    });
  }

  getTotalPagado(): number {
    return this.pagosReservacion.reduce((sum, pago) => sum + pago.monto, 0);
  }

  getPasajeroCount(): number {
    return this.reservacionSeleccionada?.pasajeros?.length ?? 0;
  }

  getPasajeros(): { dpi: string; nombre?: string }[] {
    if (!this.reservacionSeleccionada?.pasajeros) return [];
    return this.reservacionSeleccionada.pasajeros.map((p: any) => {
      if (typeof p === 'string') {
        return { dpi: p, nombre: '' };
      }
      return { dpi: p.dpi ?? '', nombre: p.nombre ?? '' };
    });
  }

  formatCurrency(value: number): string {
    return `Q.${value.toFixed(2)}`;
  }

  getDiasAntesViaje(): number {
    if (!this.reservacionSeleccionada) return 0;
    const fechaViaje = this.parseFecha(this.reservacionSeleccionada.fechaViaje);
    if (!fechaViaje) return 0;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fechaViaje.setHours(0, 0, 0, 0);
    const diffMs = fechaViaje.getTime() - hoy.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  getPorcentajeReembolso(): number {
    const dias = this.getDiasAntesViaje();
    if (dias >= 15) return 1;
    if (dias >= 7) return 0.7;
    if (dias >= 1) return 0.4;
    return 0;
  }

  getSaldoRestante(): number {
    if (!this.reservacionSeleccionada) return 0;
    const totalPagos = this.getTotalPagado();
    return Math.max(0, this.reservacionSeleccionada.costoTotal - totalPagos);
  }

  private parseFecha(fecha: string): Date | null {
    if (!fecha) return null;
    const iso = /^\d{4}-\d{2}-\d{2}$/.test(fecha);
    if (iso) {
      return new Date(`${fecha}T00:00:00`);
    }
    const partes = fecha.split('/');
    if (partes.length === 3) {
      const dia = Number(partes[0]);
      const mes = Number(partes[1]) - 1;
      const anio = Number(partes[2]);
      if (!Number.isNaN(dia) && !Number.isNaN(mes) && !Number.isNaN(anio)) {
        return new Date(anio, mes, dia);
      }
    }
    const parsed = new Date(fecha);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  getPaqueteSeleccionado(): Paquete | undefined {
    return this.paquetes.find(p => p.id == this.nuevaReservacion.paqueteId);
  }



  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    const [y, m, d] = fecha.split('-');
    return `${d}/${m}/${y}`;
  }

  getMetodoNombre(metodo: number): string {
    if (metodo === 1) return 'Efectivo';
    if (metodo === 2) return 'Tarjeta';
    return 'Transferencia';
  }

  descargarFactura(): void {
    window.open(`/api/factura/${this.reservacionSeleccionada!.id}`, '_blank');
  }

  logout(): void {
    this.authService.logout().subscribe();
    this.authService.cerrarSesion();
    this.router.navigate(['/login']);
  }
}