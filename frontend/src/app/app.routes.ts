import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login.component';
import { RegisterComponent } from './components/auth/register.component';
import { CarritoComponent } from './components/carrito/carrito.component';
import { CatalogoComponent } from './components/catalogo/catalogo.component';
import { IntroduccionComponent } from './components/introduccion/introduccion.component';
import { HistoryComponent } from './components/user/history/history.component';
import { ProfileComponent } from './components/user/profile/profile.component';
import { TicketComponent } from './components/ticket/ticket.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { customerGuard } from './core/guards/customer.guard';
import { InventoryComponent } from './components/inventory/inventory.component';
import { LegalComponent } from './components/legal/legal.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'Catalogo', component: CatalogoComponent, canActivate: [customerGuard] },
  { path: 'introduccion', component: IntroduccionComponent, canActivate: [customerGuard] },
  { path: 'carrito', component: CarritoComponent, canActivate: [customerGuard] },
  { path: 'inventario', component: InventoryComponent, canActivate: [adminGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [customerGuard] },
  { path: 'history', component: HistoryComponent, canActivate: [customerGuard] },
  { path: 'ticket', component: TicketComponent, canActivate: [customerGuard] },
  { path: 'aviso-privacidad', component: LegalComponent, canActivate: [authGuard], data: { type: 'privacy' } },
  { path: 'terminos-condiciones', component: LegalComponent, canActivate: [authGuard], data: { type: 'terms' } }
];
