import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { FormsModule } from '@angular/forms';
import { Product, ProductDetailsViewModel, ProductReviewView } from '../../types/entityTypes';
import { ToastrService } from 'ngx-toastr';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GenericConfirmDialog } from '../../shared/components/generic-confirm-dialog/generic-confirm-dialog';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-product-details',
  imports: [CommonModule, FormsModule],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
})
export class ProductDetails implements OnInit {
  private readonly placeholderImage = 'assets/images/placeholder.png';
  private destroyRef = inject(DestroyRef);
  productId = 0;
  product: ProductDetailsViewModel | null = null;
  loading = true;
  errorMessage = '';
  showConformDialog = false;
  comment: string = "";
  rating: number = 0;

  reviews: ProductReviewView[] = [
    {
        rating: 4,
        comment: 'Great product! Highly recommend it.',
        user: 'John Doe',
    },
    {
        rating: 4,
        comment: 'Great product! Highly recommend it.',
        user: 'John Doe',
    },
    {
        rating: 4,
        comment: 'Great product! Highly recommend it.',
        user: 'John Doe',
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productSer: ProductService,
    private toast: ToastrService,
    private cartSer: CartService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = Number(params.get('id'));

      if (!id) {
        this.loading = false;
        this.errorMessage = 'Product id is missing or invalid.';
        return;
      }

      this.productId = id;
      this.fetchProduct();
    });
  }

  fetchProduct(): void {
    this.loading = true;
    this.errorMessage = '';

    this.productSer.getProductbyId(this.productId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        const product = 'product' in res ? res.product : res;
        this.product = this.mapProductToViewModel(product);
        console.log('Fetched product details:', this.product);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'We could not load this product right now.';
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/user/products']);
  }

  getProductImage(): string {
    const image = this.product?.image;
    if (!image) {
      return this.placeholderImage;
    }
    return `http://localhost:3000${image}`;
  }


  getDiscountLabel(): string {
    const offer = this.product?.offer;
    if (offer === null || offer === undefined || offer === '') {
      return 'No active offer';
    }
    return typeof offer === 'number' ? `${offer}% OFF` : String(offer);
  }

  getStockLabel(): string {
    const stock = Number(this.product?.stock ?? 0);

    if (stock <= 0) {return 'Out of stock';}
    if (stock <= 10) {
      return `Low stock - ${stock} left`;
    }

    return `${stock} units ready`;
  }

  getStockTone(): string {
    const stock = Number(this.product?.stock ?? 0);
    if (stock <= 0) {
      return 'critical';
    }
    if (stock <= 10) {
      return 'warning';
    }

    return 'healthy';
  }

  getMarginPercent(): number {
    const price = Number(this.product?.price ?? 0);
    const originalPrice = Number(this.product?.originalPrice ?? 0);

    if (!price || !originalPrice || originalPrice <= price) {
      return 0;
    }

    return Math.round(((originalPrice - price) / originalPrice) * 100);
  }

  getInventoryValue(): number {
    const price = Number(this.product?.price ?? 0);
    const stock = Number(this.product?.stock ?? 0);
    return price * stock;
  }

  private mapProductToViewModel(product: Product): ProductDetailsViewModel {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      brandName: product.brandName,
      category: typeof product.category === 'string' ? product.category : product.category?.name,
      subCategory: typeof product.subCategory === 'string' ? product.subCategory : product.subCategory?.name,
      type: typeof product.type === 'string' ? product.type : product.type?.name,
      image: product.image,
      price: product.price,
      originalPrice: product.originalPrice ?? undefined,
      offer: product.offer ?? undefined,
      stock: product.stock,
      rating: Number(product.avgRating ?? 0),
      sold: product.purchaseCount ?? 0,
      reviews: product.reviews?? [],
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }



  giveFeedback(productId: number){
    if(this.comment === "" || this.rating == 0){
        this.toast.info("Please give rating and comment to give the feedback")
        return;
    }
     this.productSer.giveFeedback(productId, this.rating, this.comment).pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe({
                        next: (res)=>{
                            this.toast.success("Your feedback is added");
                            this.fetchProduct();
                            this.comment = "";
                            this.rating = 0;
                        },
                        error: (err)=>{
                            this.toast.error(err.error.message);
                        }
                    })
  }

  share() {
    const currentUrl = window.location.href;

    navigator.clipboard.writeText(currentUrl)
      .then(() => {
           this.toast.success("Product Link coopied to clickboard, use it for share the product")
      })
      .catch(err => {
        this.toast.error("Failed to copy")
      });
  }
}
