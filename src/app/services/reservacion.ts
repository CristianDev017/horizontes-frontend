import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reservacion } from '../models/reservacion.model';

@Injectable({ providedIn: 'root' })
export class ReservacionService {

  private url = '/api/reservaciones';

  constructor(private http: HttpClient) {}

  listarDelDia(): Observable<Reservacion[]> {
    return this.http.get<Reservacion[]>(this.url);
  }

  buscarPorId(id: number): Observable<Reservacion> {
    return this.http.get<Reservacion>(`${this.url}/${id}`);
  }

  buscarPorNumero(numero: string): Observable<Reservacion> {
    return this.http.get<Reservacion>(`${this.url}/numero/${numero}`);
  }

  historialCliente(dpi: string): Observable<Reservacion[]> {
    return this.http.get<Reservacion[]>(`${this.url}/cliente/${dpi}`);
  }

  crear(data: any): Observable<Reservacion> {
    return this.http.post<Reservacion>(this.url, data);
  }

  cambiarEstado(id: number, estado: string): Observable<any> {
    return this.http.put(`${this.url}/${id}`, { estado });
  }
}