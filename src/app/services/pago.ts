import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pago } from '../models/pago.model';

@Injectable({ providedIn: 'root' })
export class PagoService {

  private url = '/api/pagos';

  constructor(private http: HttpClient) {}

  listarPorReservacion(reservacionId: number): Observable<Pago[]> {
    return this.http.get<Pago[]>(`${this.url}/reservacion/${reservacionId}`);
  }

  registrar(pago: Pago): Observable<any> {
    return this.http.post(this.url, pago);
  }
}