import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { GenericConfirmDialog } from '../../../shared/components/generic-confirm-dialog/generic-confirm-dialog';
import { FormsModule } from '@angular/forms';
import { Product, ProductDetailsViewModel, ProductReviewView } from '../../../types/entityTypes';
import { ToastrService } from 'ngx-toastr';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ImageFallback } from '../../../shared/directives/image-fallback';

@Component({
  selector: 'app-product-details',
  imports: [CommonModule, GenericConfirmDialog, FormsModule, ImageFallback],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
})
export class ProductDetails implements OnInit {
  private destroyRef = inject(DestroyRef);
  private readonly placeholderImage = 'assets/images/placeholder.png';
  productId = 0;
  product: ProductDetailsViewModel | null = null;
  loading = true;
  errorMessage = '';
  showConformDialog = false;
  reviews: ProductReviewView[] = [
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productSer: ProductService,
    private toast: ToastrService
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

  deleteProduct(): void {
    this.showConformDialog = true;
  }

  handleDeleteAction(confirmed: boolean): void {
    this.showConformDialog = false;

    if (!confirmed) {
      return;
    }

    this.productSer.deleteProduct(this.productId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.toast.success('Product deleted successfully!');
        this.router.navigate(['/admin/products']);
      },
      error: (err) => {
        console.error(err);
        this.toast.error(err.error.message ||  'Failed to delete the product. Please try again later.')
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/products']);
  }

  addProduct(): void {
    this.router.navigate(['/admin/addProduct']);
  }

  updateProduct(): void {
    this.router.navigate(['/admin/update-product', this.productId]);
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
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
