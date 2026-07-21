import { Routes } from '@angular/router';
import { Home } from './features/home/home/home';
import { Ecommerce } from './features/ecommerce/ecommerce';
import { ProductDetail } from './features/product-detail/product-detail';
import {NotFound } from './features/not-found/not-found';
export const routes: Routes = [
  { path: '', component: Home },
  { path: 'ecommerce', component: Ecommerce },
 { path: 'products/:id', component: ProductDetail },
 {path:'**',component:NotFound}
];