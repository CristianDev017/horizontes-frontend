export interface ServicioPaquete {
  id: number;
  paqueteId: number;
  proveedorId: number;
  proveedorNombre: string;
  descripcion: string;
  costo: number;
  porcentajeOcupacion?: number;
}

export interface Paquete {
  id: number;
  nombre: string;
  destinoId: number;
  destinoNombre: string;
  duracionDias: number;
  descripcion: string;
  precioVenta: number;
  capacidad: number;
  activo: boolean;
  servicios?: ServicioPaquete[];
  porcentajeOcupacion?: number;
}