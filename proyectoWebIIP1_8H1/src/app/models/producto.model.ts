export interface Producto {
  id: string | null;
  nombre: string;
  precio: string;
  descripcion: string;
  imagenUrl: string;
  categoria: string;
  enStock: number;
  idCarrito: string;
}