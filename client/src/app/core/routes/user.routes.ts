import { Routes } from "@angular/router";
import { Products } from "../../features/products/products";
import { authGuard } from "../guards/auth-guard";

export const USER_ROUTES: Routes = [
    {
        path: 'products',
        component: Products
    },
    {
        path: 'viewDetails/:id',
        loadComponent: () => import('../../features/product-details/product-details').then(m => m.ProductDetails)
    },
    {
        path: 'cart',
        loadComponent: () => import('../../features/carts/carts').then(m => m.Carts),
        //canActivate: [authGuard]
    },
    {
        path: 'orders',
        loadComponent: () => import('../../features/orders/orders').then(m => m.Orders),
        //canActivate: [authGuard]
    },
    
]