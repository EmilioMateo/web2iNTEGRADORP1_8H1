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

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'Catalogo', component: CatalogoComponent, canActivate: [authGuard] },
  { path: 'introduccion', component: IntroduccionComponent, canActivate: [authGuard] },
  { path: 'carrito', component: CarritoComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'history', component: HistoryComponent, canActivate: [authGuard] },
  { path: 'ticket', component: TicketComponent, canActivate: [authGuard] }
];
