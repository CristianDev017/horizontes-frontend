import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Paquete, ServicioPaquete } from '../models/paquete.model';

@Injectable({ providedIn: 'root' })
export class PaqueteService {

  private url = '/api/paquetes';

  constructor(private http: HttpClient) {}

  listar(): Observable<Paquete[]> {
    return this.http.get<Paquete[]>(this.url);
  }

  buscarPorId(id: number): Observable<Paquete> {
    return this.http.get<Paquete>(`${this.url}/${id}`);
  }

  listarPorDestino(destinoId: number): Observable<Paquete[]> {
    return this.http.get<Paquete[]>(`${this.url}?destino=${destinoId}`);
  }

  crear(paquete: Paquete): Observable<Paquete> {
    return this.http.post<Paquete>(this.url, paquete);
  }

  actualizar(id: number, paquete: Paquete): Observable<Paquete> {
    return this.http.put<Paquete>(`${this.url}/${id}`, paquete);
  }

  desactivar(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`);
  }

  agregarServicio(paqueteId: number, servicio: ServicioPaquete): Observable<ServicioPaquete> {
    return this.http.post<ServicioPaquete>(`${this.url}/${paqueteId}/servicios`, servicio);
  }

  listarServicios(paqueteId: number): Observable<ServicioPaquete[]> {
    return this.http.get<ServicioPaquete[]>(`${this.url}/${paqueteId}/servicios`);
  }
}