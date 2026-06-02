import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CatalogSearchService } from '../../services/catalog-search.service';
import { ProductsService } from '../../services/products.service';
import { Producto, ProductoPayload } from '../../models/product.model';
import { ProductCardComponent } from '../product-card/product-card.component';
import { CarritoService } from '../../services/carrito.service';
import { environment } from '../../config/environment';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.css'
})
export class CatalogoComponent {
  private productsService = inject(ProductsService);
  private catalogSearch = inject(CatalogSearchService);
  private apiBaseUrl = environment.apiUrl.replace('/api', '');
  authService = inject(AuthService);
  carritoService = inject(CarritoService);

  productos = signal<Producto[]>([]);
  showModal = signal(false);
  selectedProduct = signal<Producto | null>(null);
  isSaving = false;
  isLoading = false;
  agregadoModal = false;

  alAgregarModal(producto: Producto): void {
    if (producto.enStock <= 0) return;
    this.carritoService.agregar(producto);
    this.agregadoModal = true;
    setTimeout(() => this.agregadoModal = false, 2000);
  }

  selectedCategories: string[] = [];
  selectedMuscles: string[] = [];
  selectedTrainingTypes: string[] = [];
  selectedPriceRanges: string[] = [];
  selectedAvailability: string[] = [];
  selectedSizes: string[] = [];
  selectedWeightRanges: string[] = [];

  categoryOptions = [
    'Maquinas de fuerza',
    'Bancos',
    'Racks y jaulas',
    'Cardio',
    'Pesas libres',
    'Accesorios',
    'Barras y discos',
    'Poleas',
    'Multifuncionales'
  ];

  muscleOptions = [
    'Pecho',
    'Espalda',
    'Pierna',
    'Hombro',
    'Biceps',
    'Triceps',
    'Abdomen',
    'Gluteo',
    'Cuerpo completo',
    'Equipo para home gym'
  ];

  trainingOptions = [
    'Fuerza',
    'Hipertrofia',
    'Cardio',
    'Funcional',
    'Rehabilitacion',
    'Cross training',
    'Powerlifting',
    'Home gym',
    'Uso comercial'
  ];

  priceRanges = [
    { label: 'Menos de $5,000', min: 0, max: 4999 },
    { label: '$5,000 - $15,000', min: 5000, max: 15000 },
    { label: '$15,000 - $30,000', min: 15000, max: 30000 },
    { label: '$30,000 - $60,000', min: 30000, max: 60000 },
    { label: 'Mas de $60,000', min: 60001, max: Infinity }
  ];

  availabilityOptions = ['En stock', 'Agotado'];
  sizeOptions = ['Compacto', 'Mediano', 'Grande', 'Requiere espacio amplio', 'Plegable', 'Ahorro de espacio'];
  weightOptions = ['Hasta 100 kg', '100 - 200 kg', '200 - 300 kg', 'Mas de 300 kg'];

  categoryDraft = '';
  muscleDraft = '';
  trainingDraft = '';
  sizeDraft = '';
  weightDraft = '';
  productCategories: string[] = [];
  productMuscles: string[] = [];
  productTrainingTypes: string[] = [];
  productSizes: string[] = [];
  productWeightRanges: string[] = [];

  newProduct: ProductoPayload = this.crearProductoVacio();

  constructor() {
    this.refrescarProductos();
  }

  get productosFiltrados(): Producto[] {
    const term = this.catalogSearch.searchTerm().trim().toLowerCase();

    return this.productos().filter(producto => {
      if (producto.enStock <= 0) {
        return false;
      }

      const precio = Number(producto.precio);
      const matchesName = !term || producto.nombre.toLowerCase().includes(term);
      const matchesCategory = this.matchesList(this.selectedCategories, producto.categoria);
      const matchesMuscle = this.matchesList(this.selectedMuscles, producto.grupoMuscular);
      const matchesTraining = this.matchesList(this.selectedTrainingTypes, producto.tipoEntrenamiento);
      const matchesPrice = this.matchesPrice(precio);
      const matchesAvailability = this.matchesAvailability(producto.enStock);
      const matchesSize = this.matchesList(this.selectedSizes, producto.tamano);
      const matchesWeight = this.matchesWeight(producto);

      return matchesName && matchesCategory && matchesMuscle && matchesTraining && matchesPrice && matchesAvailability && matchesSize && matchesWeight;
    });
  }

  get hasActiveFilters(): boolean {
    return [
      this.selectedCategories,
      this.selectedMuscles,
      this.selectedTrainingTypes,
      this.selectedPriceRanges,
      this.selectedAvailability,
      this.selectedSizes,
      this.selectedWeightRanges
    ].some(filter => filter.length > 0);
  }

  createProduct(event: Event): void {
    event.preventDefault();
    this.isSaving = true;

    if (this.productCategories.length === 0) {
      alert('Selecciona al menos una categoria');
      this.isSaving = false;
      return;
    }

    const payload = { ...this.newProduct };
    payload.categoria = this.productCategories.join(', ');
    payload.grupoMuscular = this.productMuscles.join(', ');
    payload.tipoEntrenamiento = this.productTrainingTypes.join(', ');
    payload.tamano = this.productSizes.join(', ');
    payload.pesoMaximoSoportado = this.productWeightRanges.join(', ');

    this.productsService.crear(payload).subscribe({
      next: () => {
        alert('Producto creado');
        this.closeCreateModal();
        this.refrescarProductos();
      },
      error: () => alert('Error al crear producto'),
      complete: () => (this.isSaving = false)
    });
  }

  refrescarProductos(): void {
    this.isLoading = true;
    this.productsService.obtenerTodos().subscribe({
      next: productos => this.productos.set(productos),
      complete: () => (this.isLoading = false)
    });
  }

  imageSrc(producto: Producto): string {
    if (!producto.imagenUrl) {
      return '';
    }

    return producto.imagenUrl.startsWith('/uploads')
      ? `${this.apiBaseUrl}${producto.imagenUrl}`
      : producto.imagenUrl;
  }

  clearFilters(): void {
    this.selectedCategories = [];
    this.selectedMuscles = [];
    this.selectedTrainingTypes = [];
    this.selectedPriceRanges = [];
    this.selectedAvailability = [];
    this.selectedSizes = [];
    this.selectedWeightRanges = [];
  }

  addSelection(list: string[], value: string): void {
    if (value && !list.includes(value)) {
      list.push(value);
    }
  }

  setSingleSelection(list: string[], value: string): void {
    list.splice(0, list.length);

    if (value) {
      list.push(value);
    }
  }

  removeSelection(list: string[], value: string): void {
    const index = list.indexOf(value);

    if (index >= 0) {
      list.splice(index, 1);
    }
  }

  toggleOption(list: string[], value: string): void {
    const index = list.indexOf(value);

    if (index >= 0) {
      list.splice(index, 1);
      return;
    }

    list.push(value);
  }

  isSelected(list: string[], value: string): boolean {
    return list.includes(value);
  }

  openProduct(producto: Producto): void {
    this.selectedProduct.set(producto);
  }

  closeProduct(): void {
    this.selectedProduct.set(null);
  }

  closeCreateModal(): void {
    this.showModal.set(false);
    this.newProduct = this.crearProductoVacio();
    this.categoryDraft = '';
    this.muscleDraft = '';
    this.trainingDraft = '';
    this.sizeDraft = '';
    this.weightDraft = '';
    this.productCategories = [];
    this.productMuscles = [];
    this.productTrainingTypes = [];
    this.productSizes = [];
    this.productWeightRanges = [];
  }

  private crearProductoVacio(): ProductoPayload {
    return {
      nombre: '',
      precio: 0,
      descripcion: '',
      imagenUrl: '',
      categoria: '',
      grupoMuscular: '',
      tipoEntrenamiento: '',
      tamano: '',
      pesoMaximoSoportado: '',
      especificaciones: '',
      enStock: 0
    };
  }

  private matchesList(selected: string[], value?: string): boolean {
    if (selected.length === 0) return true;
    if (!value) return false;
    const productValues = value.split(',').map(v => v.trim());
    return selected.some(s => productValues.includes(s));
  }

  private matchesPrice(precio: number): boolean {
    return this.selectedPriceRanges.length === 0 || this.priceRanges
      .filter(range => this.selectedPriceRanges.includes(range.label))
      .some(range => precio >= range.min && precio <= range.max);
  }

  private matchesAvailability(enStock: number): boolean {
    if (this.selectedAvailability.length === 0) {
      return true;
    }

    const inStock = this.selectedAvailability.includes('En stock') && enStock > 0;
    const outOfStock = this.selectedAvailability.includes('Agotado') && enStock <= 0;
    return inStock || outOfStock;
  }

  private matchesWeight(producto: Producto): boolean {
    if (this.selectedWeightRanges.length === 0) {
      return true;
    }

    return !!producto.pesoMaximoSoportado && this.selectedWeightRanges.includes(producto.pesoMaximoSoportado);
  }
}
