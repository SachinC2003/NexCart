import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { ToastrService } from 'ngx-toastr';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Order, OrderItem } from '../../types/entityTypes';
import { environment } from '../../../environments/environment.development';
import { ImageFallback } from '../../shared/directives/image-fallback';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, ImageFallback],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders {
      private destryRef = inject(DestroyRef);
      private readonly placeholderImage = 'assets/images/placeholder.png';
      private readonly deletedProductLabel = 'Currently this product is deleted';
      loading = true;
      errorMessage = '';
      orders: Order[] = [];
      currentPage = 1;
      itemsPerPage = 5;
      totalPages = 0;

      currentStatusFilter = 'ALL';

      constructor(private orderSer: OrderService,
                  private router: Router,
                  private toast: ToastrService
      ){}

      ngOnInit(){
         this.getOrdersForPage(this.currentPage, this.currentStatusFilter);
      }

      getOrdersForPage(page: number, status: string = 'ALL'){
        this.currentPage = page;
          this.orderSer.getOrders(this.currentPage, this.itemsPerPage, status).pipe(takeUntilDestroyed(this.destryRef)).subscribe({
              next: (res)=>{
                  this.orders = res.orders ?? [];
                  this.totalPages = res.totalPages ?? 0;
                  this.currentPage = res.page ?? this.currentPage;
                  this.loading = false;
              },
              error: (err)=>{
                  this.errorMessage = err.error?.message ?? 'Could not load orders';
                  this.loading = false;
                  this.toast.error(this.errorMessage);
              }
         })
      }

      updateOrderStatus(orderId: number, status: string){
        console.log('order id in com ', orderId)
         this.orderSer.updateOrderStatus(orderId, status).pipe(takeUntilDestroyed(this.destryRef)).subscribe({
              next: (res)=>{
                 this.toast.success('Order status updated to ' + status + ' successfully');
              },
              error: (err)=>{
                  const errorMessage = err.error?.message ?? 'Could not update order status';
                  this.toast.error(errorMessage);
              }
         })
      }

      onPageChange(page: number){
          if(page < 1 || page > this.totalPages){
            return;
          }

          this.getOrdersForPage(page, this.currentStatusFilter);
      }

      filterByStatus(status: string){
         this.loading = true;
         this.getOrdersForPage(1, this.currentStatusFilter = status);
      }

      goBack(): void {
        this.router.navigate(['/user/products']);
      }


      get totalOrders(): number {
        return this.orders.length;
      }

      get totalSpent(): number {
        return this.orders.reduce((sum, order) => sum + Number(order.totalAmount ?? 0), 0);
      }

      get totalItems(): number {
        return this.orders.reduce((sum, order) => {
          return sum + (order.orderItems ?? []).reduce((itemSum, item) => itemSum + Number(item.quantity ?? 0), 0);
        }, 0);
      }

      getOrderItems(order: Order): OrderItem[] {
        return order.orderItems ?? [];
      }

      getProductImage(image: string | null | undefined): string {
        if (!image) {
          return this.placeholderImage;
        }

        const baseUrl = environment.apiUrl.replace('/api', '');
        return `${baseUrl}${image}`;
      }

      isProductDeleted(item: OrderItem): boolean {
        return !item.product;
      }

      getProductName(item: OrderItem): string {
        return item.product?.name || this.deletedProductLabel;
      }

      getProductBrand(item: OrderItem): string {
        return item.product?.brandName || 'Product removed';
      }

      getProductDescription(item: OrderItem): string {
        return item.product?.description || 'Currently this product is deleted.';
      }

      getProductPrice(item: OrderItem): number | string {
        return item.product?.price ?? 'N/A';
      }

      getStatusLabel(status: string | number | null | undefined): string {
        if (status === null || status === undefined || status === '') {
          return 'Pending';
        }

        if (typeof status === 'number') {
          const numericStatusMap: Record<number, string> = {
            0: 'Placed',
            1: 'Cancelled',
            2: 'Delivered',
          };

          return numericStatusMap[status] ?? 'Pending';
        }

        return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
      }

      getStatusClass(status: string | number | null | undefined): string {
        const label = this.getStatusLabel(status).toLowerCase();

        if (label.includes('delivered')) {
          return 'delivered';
        }

        if (label.includes('cancelled')) {
          return 'cancelled';
        }

        return 'placed';
      }

      formatDate(date: string | null | undefined): string {
        if (!date) {
          return 'Date unavailable';
        }

        return new Date(date).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
}
