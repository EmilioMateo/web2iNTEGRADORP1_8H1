import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login.component';
import { RegisterComponent } from './components/auth/register.component';
import { CarritoComponent } from './components/carrito/carrito.component';
import { CatalogoComponent } from './components/catalogo/catalogo.component';
import { IntroduccionComponent } from './components/introduccion/introduccion.component';

export const routes: Routes = [
  { path: '', component: CatalogoComponent },
  { path: 'introduccion', component: IntroduccionComponent },
  { path: 'carrito', component: CarritoComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent }
];

