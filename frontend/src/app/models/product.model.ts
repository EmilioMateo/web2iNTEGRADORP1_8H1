export interface Producto {
  id: string | null;
  nombre: string;
  precio: number;
  descripcion: string;
  imagenUrl: string;
  categoria: string;
  enStock: number;
  idCarrito?: string;
}

export type ProductoPayload = Omit<Producto, 'idCarrito'> & {
  id: string;
  idCarrito?: string;
};


