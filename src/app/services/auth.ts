import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private url = '/api/login';
  private usuarioActual: Usuario | null = null;

  constructor(private http: HttpClient) {}

  login(nombre: string, password: string): Observable<Usuario> {
    return this.http.post<Usuario>(this.url, { nombre, password });
  }

  logout(): Observable<any> {
    return this.http.post('/api/logout', {});
  }

  setUsuario(u: Usuario): void {
    this.usuarioActual = u;
    localStorage.setItem('usuario', JSON.stringify(u));
  }

  getUsuario(): Usuario | null {
    if (this.usuarioActual) return this.usuarioActual;
    const data = localStorage.getItem('usuario');
    return data ? JSON.parse(data) : null;
  }

  getTipo(): number {
    return this.getUsuario()?.tipo ?? 0;
  }

  isLoggedIn(): boolean {
    return this.getUsuario() !== null;
  }

  cerrarSesion(): void {
    this.usuarioActual = null;
    localStorage.removeItem('usuario');
  }
}