import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Destino } from '../models/destino.model';

@Injectable({ providedIn: 'root' })
export class DestinoService {

  private url = '/api/destinos';

  constructor(private http: HttpClient) {}

  listar(): Observable<Destino[]> {
    return this.http.get<Destino[]>(this.url);
  }

  buscarPorId(id: number): Observable<Destino> {
    return this.http.get<Destino>(`${this.url}/${id}`);
  }

  crear(destino: Destino): Observable<Destino> {
    return this.http.post<Destino>(this.url, destino);
  }

  actualizar(id: number, destino: Destino): Observable<Destino> {
    return this.http.put<Destino>(`${this.url}/${id}`, destino);
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`);
  }
}