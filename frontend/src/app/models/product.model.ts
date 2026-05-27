export interface Producto {
  id: number | null;
  nombre: string;
  precio: number;
  descripcion: string;
  imagenUrl: string;
  categoria: string;
  especificaciones?: string;
  grupoMuscular?: string;
  tipoEntrenamiento?: string;
  tamano?: string;
  pesoMaximoSoportado?: string;
  enStock: number;
  idCarrito?: string;
  cantidad?: number;
}

export type ProductoPayload = Omit<Producto, 'id' | 'idCarrito'>;



