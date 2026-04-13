import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
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
  isEditarUsuario: boolean = false;
  usuarioOriginalId: number | null = null;

  // Carga de datos
  archivoCarga: File | null = null;
  resultadoCarga: any = null;
  cargando: boolean = false;

  // Reportes
  fechaInicio: string = '';
  fechaFin: string = '';
  reporteSeleccionado: string = 'ventas';
  datosReporte: any = null;

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
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

    const nombre = (this.nuevoUsuario.nombre || '').trim();
    const password = (this.nuevoUsuario.password || '').trim();
    if (!nombre || (!this.isEditarUsuario && !password)) {
      this.errorUsuario = 'Completa todos los campos'; return;
    }

    if (this.isEditarUsuario && this.usuarioOriginalId !== null) {
      const usuarioPayload: Partial<Usuario> = {
        nombre,
        tipo: this.nuevoUsuario.tipo
      };
      if (password) {
        usuarioPayload.password = password;
      }

      this.usuarioService.actualizar(this.usuarioOriginalId, usuarioPayload as Usuario).subscribe({
        next: () => {
          this.mensajeUsuario = 'Usuario actualizado correctamente';
          this.resetUsuarioForm();
          this.cargarUsuarios();
        },
        error: (e: any) => this.errorUsuario = e.error?.error || 'Error al actualizar usuario'
      });
      return;
    }

    const usuarioPayload: Partial<Usuario> = {
      nombre,
      password,
      tipo: this.nuevoUsuario.tipo
    };

    this.usuarioService.crear(usuarioPayload as Usuario).subscribe({
      next: () => {
        this.mensajeUsuario = 'Usuario creado correctamente';
        this.resetUsuarioForm();
        this.cargarUsuarios();
      },
      error: (e: any) => this.errorUsuario = e.error?.error || 'Error al crear usuario'
    });
  }

  editarUsuario(usuario: Usuario): void {
    this.mostrarFormUsuario = true;
    this.isEditarUsuario = true;
    this.usuarioOriginalId = usuario.id;
    this.nuevoUsuario = { ...usuario, password: '' };
    this.mensajeUsuario = '';
    this.errorUsuario = '';
  }

  resetUsuarioForm(): void {
    this.nuevoUsuario = { id: 0, nombre: '', password: '', tipo: 1 };
    this.mostrarFormUsuario = false;
    this.isEditarUsuario = false;
    this.usuarioOriginalId = null;
  }

  toggleUsuarioForm(): void {
    if (this.mostrarFormUsuario) {
      this.resetUsuarioForm();
    } else {
      this.mostrarFormUsuario = true;
      this.isEditarUsuario = false;
      this.usuarioOriginalId = null;
      this.errorUsuario = '';
      this.mensajeUsuario = '';
    }
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
  this.http.post('/api/carga', formData).subscribe({
    next: (data) => {
      this.resultadoCarga = data;
      this.archivoCarga = null;
      this.cargarUsuarios();
      this.cargando = false;
      this.cdr.detectChanges();
    },
    error: () => {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  });
}

  // ---- REPORTES ----
  generarReporte(): void {
    const params = this.fechaInicio && this.fechaFin
      ? `?inicio=${this.fechaInicio}&fin=${this.fechaFin}`
      : '';
    this.http.get<any>(`/api/reportes/${this.reporteSeleccionado}${params}`)
      .subscribe({
        next: (data) => {
          this.datosReporte = data;
          this.cdr.detectChanges();
        },
        error: (e: any) => {
          console.error('Error al generar reporte:', e);
        }
      });
  }

  esArray(data: any): boolean {
    return Array.isArray(data);
  }

  getColumnas(obj: any): string[] {
    return Object.keys(obj);
  }

  exportarPDF(): void {
    if (!this.datosReporte) return;
    const datos = this.esArray(this.datosReporte) ? this.datosReporte : [this.datosReporte];
    if (datos.length === 0) return;
    const cols = this.getColumnas(datos[0]);
    const header = cols.map(c => c.toUpperCase()).join(' | ');
    const separator = '-'.repeat(Math.max(header.length, 80));
    const lines = [
      'HORIZONTES SIN LIMITES',
      `REPORTE: ${this.reporteSeleccionado.toUpperCase()}`,
      `FECHA DE EXPORTACION: ${new Date().toLocaleDateString()}`,
      separator,
      header,
      separator,
      ...datos.map((fila: any) => cols.map((c: string) => this.escapePdfText(String(fila[c] ?? ''))).join(' | ')),
      separator
    ];

    const contentStream = this.buildPdfContent(lines);
    const pdfString = this.buildPdfFile(contentStream);
    const blob = new Blob([pdfString], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-${this.reporteSeleccionado}.pdf`;
    a.click();
  }

  private escapePdfText(text: string): string {
    return text.replace(/([\\()])/g, '\\$1');
  }

  private buildPdfContent(lines: string[]): string {
    const escapedLines = lines.map(line => line.replace(/\r?\n/g, ' '));
    let content = `BT /F1 18 Tf 40 820 Td (${escapedLines[0]}) Tj`;
    if (escapedLines.length > 1) {
      content += ` /F1 14 Tf 0 -24 Td (${escapedLines[1]}) Tj`;
      content += ` 0 -20 Td (${escapedLines[2]}) Tj`;
      content += ` 0 -24 Td (${escapedLines[3]}) Tj`;
      content += ` 0 -20 Td (${escapedLines[4]}) Tj`;
      content += ` 0 -20 Td (${escapedLines[5]}) Tj`;
      for (let i = 6; i < escapedLines.length; i++) {
        content += ` 0 -18 Td (${escapedLines[i]}) Tj`;
      }
    }
    return `${content} ET`;
  }

  private buildPdfFile(contentStream: string): string {
    const objects = [
      `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`,
      `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`,
      `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n`,
      `4 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream\nendobj\n`,
      `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`
    ];

    let body = '';
    const offsets: number[] = [];
    for (const obj of objects) {
      offsets.push(body.length);
      body += obj;
    }

    const xref = [`xref`, `0 ${objects.length + 1}`, `0000000000 65535 f `, ...offsets.map(offset => `${offset.toString().padStart(10, '0')} 00000 n `)].join('\n') + '\n';
    const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${body.length}\n%%EOF\n`;
    return `%PDF-1.3\n${body}${xref}${trailer}`;
  }

  logout(): void {
    this.authService.logout().subscribe();
    this.authService.cerrarSesion();
    this.router.navigate(['/login']);
  }
}