export interface Pago {
  id?: number;
  reservacionId: number;
  monto: number;
  metodo: number;
  fecha: string;
}