export interface Reservacion {
  id: number;
  numero: string;
  fechaCreacion: string;
  fechaViaje: string;
  paqueteId: number;
  paqueteNombre: string;
  agenteId: number;
  agenteNombre: string;
  costoTotal: number;
  estado: string;
  pasajeros?: any[];
}