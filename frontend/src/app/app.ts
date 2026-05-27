import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CatalogSearchService } from './services/catalog-search.service';
import { CarritoService } from './services/carrito.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('producto-integrador');
  authService = inject(AuthService);
  catalogSearch = inject(CatalogSearchService);
  carritoService = inject(CarritoService);
  private router = inject(Router);

  isMenuOpen = signal(false);

  isAuthPage(): boolean {
    return ['/login', '/register'].includes(this.router.url);
  }

  isCatalogPage(): boolean {
    return this.router.url.toLowerCase().startsWith('/catalogo');
  }

  toggleMenu(): void {
    this.isMenuOpen.set(!this.isMenuOpen());
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  getUserInitial(): string {
    return this.authService.user()?.correo?.charAt(0).toUpperCase() || 'U';
  }

  getUserName(): string {
    const correo = this.authService.user()?.correo;
    return correo ? correo.split('@')[0] : 'usuario';
  }

  getRoleLabel(): string {
    const rol = this.authService.user()?.rol;

    if (rol === 'admin') {
      return 'Admin';
    }

    return '';
  }

  logout(): void {
    this.authService.logout();
    this.closeMenu();
    this.router.navigate(['/login']);
  }
}
