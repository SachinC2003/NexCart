import { Routes } from '@angular/router';
import { ProductResolver } from '../resolvers/product-resolver';
import { StatsResolver } from '../resolvers/stats-resolver';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'products',
    loadComponent: () => import('../../features/admin/products/products').then(m => m.Products),
    resolve: { stats: StatsResolver }
  },
  {
    path: 'addProduct',
    loadComponent: () => import('../../features/admin/add-product/add-product').then(m => m.AddProduct)
  },
  {
    path: 'update-product/:id',
    loadComponent: () => import('../../features/admin/update-product/update-product').then(m => m.UpdateProduct),
    resolve: { product: ProductResolver }
  },
  {
     path: 'viewDetails/:id',
     loadComponent: () => import('../../features/admin/product-details/product-details').then(m => m.ProductDetails)
  },
  {
    path: 'stats',
    loadComponent: () => import('../../features/admin/stats/stats').then(m => m.Stats),
    resolve: { stats: StatsResolver }
  },
  {
    path: 'orders',
    loadComponent: () => import('../../features/admin/orders/orders').then(m => m.Orders),
  }
];