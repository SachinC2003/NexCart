import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { Cart, CartItem } from '../../types/entityTypes';
import { CartService } from '../../core/services/cart.service';
import { ToastrService } from 'ngx-toastr';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../../environments/environment.development';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../core/services/order.service';
import { Router } from '@angular/router';
export interface SelectedItem{
   productId: number,
   quantity: number
  }
@Component({
  selector: 'app-carts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './carts.html',
  styleUrl: './carts.css',
})
export class Carts {
    loading: boolean = true;
    errormessage: string = '';
    cart: Cart | null = null;
    selectedItems: SelectedItem[] = [];
    isModelOpen :  boolean = false;
    paymentMethod: string= "";
    location: string= ""

    private readonly placeholderImage = 'assets/images/placeholder.png';
    private destroyRef = inject(DestroyRef);
    constructor(private cartSer: CartService,
                private toast: ToastrService,
                private orderSer: OrderService,
                private router: Router
    ){}

    ngOnInit(): void{
        this.cartSer.getCartItems().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (res)=>{
                this.cart = res.cart ?? null;
                this.loading = false;
            },
            error: (err)=>{
               this.errormessage = err.error?.message;
               this.loading = false;
               this.toast.error(this.errormessage || 'Could not load cart');
            }
        })
    }

    itemSelection(productId: number, quantity: number, event: Event){
       if((event.target as HTMLInputElement).checked){
           this.selectedItems.push({productId, quantity})
           console.log(this.selectedItems);
       }else{
           this.selectedItems = this.selectedItems.filter(item=> item.productId !== productId);
           console.log(this.selectedItems)
       }
    }

    changeQuantity(productId: number, stock: number, increment: boolean){
       const item = this.selectedItems.find((item)=> item.productId === productId);
       const actualItem = this.cart?.cartItems?.find((item)=> item.product.id === productId)

       if(item){
          if(increment){
              item.quantity = item.quantity + 1 > stock ? stock : item.quantity + 1;
          }
          else{
            item.quantity = item.quantity - 1 < 1 ? 1 : item.quantity - 1;
          }

          if(actualItem){
                actualItem.quantity = item.quantity;
          }
       }
    }

    proceedTocheckOut(){
       if(this.selectedItems.length === 0){
          this.toast.error("Please select at least one cart item");
          return;
       }

       this.isModelOpen = true;
    }

    closeCheckoutModal(){
      this.isModelOpen = false;
    }

    continueShopping(): void {
      this.router.navigate(['/user/products']);
    }

    putOrder(){
       this.orderSer.createOrder(this.paymentMethod, this.location, this.grandTotal, this.selectedItems)
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe({
                        next: (res)=>{
                            this.toast.success(res.message || "Order Placed successfully");
                            this.isModelOpen = false;
                            this.clearCart();
                            this.router.navigate(['/user/products'])
                        },
                        error: (err)=>{
                             //this.toast.error(err.error.message || "Order failed")
                        }
                    })
    }

    clearCart(){
       this.cartSer.clearCart().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
           next: (res)=>{
                console.log("cart cleared")
           },
           error: (err)=>{
               console.log(err.error.message);
           }
       })
    }







    get cartItems(): CartItem[] {
      return this.cart?.cartItems ?? [];
    }

    get totalItems(): number {
      return this.selectedItems.reduce((sum, item) => sum + item.quantity, 0);
    }

    get subtotal(): number {
      return this.cartItems
              .filter(cartItem => this.selectedItems.some(s => s.productId === cartItem.product.id))
              .reduce((sum, item) => sum + (this.getProductPrice(item) * item.quantity), 0);
    }

    get originalTotal(): number {
      return this.cartItems
                .filter(cartItem => this.selectedItems.some(s => s.productId === cartItem.product.id))
                .reduce((sum, item) => sum + (this.getOriginalPrice(item) * item.quantity), 0);
    }

    get savings(): number {
      return Math.max(this.originalTotal - this.subtotal, 0);
    }

    get deliveryFee(): number {
      return this.subtotal > 500 ? 0 : 49
    }

    get grandTotal(): number {
      return this.subtotal + this.deliveryFee;
    }

    getProductImage(image: string | null | undefined): string {
      if (!image) {
        return this.placeholderImage;
      }

      const baseUrl = environment.apiUrl.replace('/api', '');
      return `${baseUrl}${image}`;
    }

    getProductPrice(item: CartItem): number {
      return Number(item.product?.price ?? 0);
    }

    getOriginalPrice(item: CartItem): number {
      return Number(item.product?.originalPrice ?? item.product?.price ?? 0);
    }

    getLineTotal(item: CartItem): number {
      return this.getProductPrice(item) * item.quantity;
    }
}
