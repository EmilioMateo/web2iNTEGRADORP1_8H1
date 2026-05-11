import { Routes } from '@angular/router';
import {Catalogo} from './components/catalogo/catalogo'
import {IntroduccionComponent} from './components/introduccion/introduccion'
import {CarritoComponent} from './carrito/carrito.component'
import {LoginComponent} from './components/auth/login.component'
import {RegisterComponent} from './components/auth/register.component'

export const routes: Routes = [
    {path:'', component:Catalogo},
    {path:'introduccion', component:IntroduccionComponent},
    {path:'carrito', component:CarritoComponent},
    {path:'login', component:LoginComponent},
    {path:'register', component:RegisterComponent},
];
