export interface Usuario {
  id: number;
  nombre: string;
  password?: string;
  tipo: number;
  activo?: boolean;
}