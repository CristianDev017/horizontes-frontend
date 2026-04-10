import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from '../models/cliente.model';

@Injectable({ providedIn: 'root' })
export class ClienteService {

  private url = '/api/clientes';

  constructor(private http: HttpClient) {}

  listar(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.url);
  }

  buscarPorDpi(dpi: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.url}/${dpi}`);
  }

  crear(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(this.url, cliente);
  }

  actualizar(dpi: string, cliente: Cliente): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.url}/${dpi}`, cliente);
  }
}