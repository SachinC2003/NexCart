import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { Category, FilterOption, Product, ProductFIlterData, ProductType, QuickStatCard, SubCategory } from '../../types/entityTypes';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CartService } from '../../core/services/cart.service';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { AuthSessionService } from '../../core/services/auth-session.service';
import { SearchBar } from '../../shared/components/generic-searchBar/generic-searchBar';
import { FormsModule } from '@angular/forms';
import { Utils } from '../../shared/utils';
import { ImageFallback } from '../../shared/directives/image-fallback';

type ProductFieldValue = string | ProductType | Category | SubCategory | null | undefined;

@Component({
  selector: 'app-products',
  imports: [CommonModule, SearchBar, FormsModule, ImageFallback],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products {
  private readonly placeholderImage = 'assets/images/placeholder.png';
  isLoading = false;
  private destroyRef = inject(DestroyRef);
  private utils = new Utils();
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productSer: ProductService,
    private cartSer: CartService,
    private toast: ToastrService,
    public userSer: UserService,
    private authSer: AuthService,
    private authSession: AuthSessionService
  ) {}

  products: Product[] = [];
  taxonomy: ProductType[] = [];
  availableTypes: FilterOption[] = [];
  availableCategories: FilterOption[] = [];
  availableSubCategories: FilterOption[] = [];

  minP: number = 0;
  maxP: number = 9999999;

  selectedType = '';
  selectedCategory = '';
  selectedSubCategory = '';
  searchTerm = '';

  filterData : ProductFIlterData ={
     type: this.selectedType,
     category: this.selectedCategory,
     subCategory: this.selectedSubCategory,
     searchTerm: this.searchTerm,
     minPrice: this.minP,
     maxPrice: this.maxP
  }

  ngOnInit() {
    this.handleRouteToasts();
    this.getTaxonomy();
    this.loadProducts(this.filterData);
  }

  currentPage = 1;
  pageSize = 5;
  totalItems = 0;

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  loadProducts(filterData: ProductFIlterData) {
    this.isLoading = true;
    this.productSer.getProducts(this.currentPage, this.pageSize, filterData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (res) => {
        this.products = res.products ?? [];
        this.totalItems = res.total ?? this.products.length;
        this.isLoading = false; // Stop loading on success
      },
      error: (err) => {
        console.error(err);
        this.toast.error(err.error.message || "Please wait for some time, server error")
        this.isLoading = false; // Stop loading on error
      }
    });
  }

  updateFilterData(resetPage: boolean = true){
     this.filterData = {
      type: this.selectedType,
      category: this.selectedCategory,
      subCategory: this.selectedSubCategory,
      searchTerm: this.searchTerm,
      minPrice: this.minP,
      maxPrice: this.maxP
    };
    if(resetPage)this.currentPage = 1; // Reset to page 1 when filtering
    this.loadProducts(this.filterData);
  }

onPageChange(newPage: number) {
  if (newPage < 1 || newPage > this.totalPages || newPage === this.currentPage) {
    return;
  }

  this.currentPage = newPage;
  this.updateFilterData(false);
}

  getTaxonomy() {
    this.productSer.getTaxonomy().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.taxonomy = res.taxonomy ?? [];
        this.availableTypes = [
          { value: '', label: 'All Types' },
          ...this.taxonomy.map((type) => ({ value: type.name, label: type.name })),
        ];
        this.availableCategories = [{ value: '', label: 'All Categories' }];
        this.availableSubCategories = [{ value: '', label: 'All Sub-categories' }];
      },
      error: (err) => {
        console.error('Error fetching taxonomy:', err);
      },
    });
  }

  onTypeChange(value: string) {
    this.selectedType = value;
    this.selectedCategory = '';
    this.selectedSubCategory = '';

    const typeData = this.taxonomy.find((type) => type.name === value);
    this.availableCategories = [
      { value: '', label: 'All Categories' },
      ...((typeData?.categories ?? []).map((category) => ({
        value: category.name,
        label: category.name,
      }))),
    ];
    this.availableSubCategories = [{ value: '', label: 'All Sub-categories' }];
    this.updateFilterData();
  }

  onCategoryChange(value: string) {
    this.selectedCategory = value;
    this.selectedSubCategory = '';

    const typeData = this.taxonomy.find((type) => type.name === this.selectedType);
    const categoryData = (typeData?.categories ?? []).find((category) => category.name === value);

    this.availableSubCategories = [
      { value: '', label: 'All Sub-categories' },
      ...((categoryData?.subCategories ?? []).map((subCategory) => ({
        value: subCategory.name,
        label: subCategory.name,
      }))),
    ];

    this.updateFilterData();
  }

  onSubCategoryChange(value: string) {
    this.selectedSubCategory = value;
    this.updateFilterData();
  }

  onSearchChange(searchTerm: string) {
    this.searchTerm = searchTerm.trim().toLowerCase();
    this.updateFilterData();
  }

  onPriceChanges(){
      this.updateFilterData();
  }

  clearFilters() {
    this.selectedType = '';
    this.selectedCategory = '';
    this.selectedSubCategory = '';
    this.searchTerm = '';
    this.availableCategories = [{ value: '', label: 'All Categories' }];
    this.availableSubCategories = [{ value: '', label: 'All Sub-categories' }];
    this.minP = 0;
    this.maxP = 9999999;
    this.updateFilterData();
  }

  get filteredProducts() {
    return this.products;
  }

  get quickStats(): QuickStatCard[] {
    const totalCategories = this.taxonomy.reduce((count, type) => count + (type.categories?.length ?? 0), 0);
    const availableProducts = this.products.filter(product => product.stock > 0).length;

    return [
      {
        label: 'Live products',
        value: this.utils.formatNumber(this.totalItems),
        detail: `Across ${Math.max(1, this.totalPages)} catalog page${this.totalPages === 1 ? '' : 's'}`,
      },
      {
        label: 'Available now',
        value: this.utils.formatNumber(availableProducts),
        detail: 'Items in stock on this page',
      },
      {
        label: 'Collections',
        value: this.utils.formatNumber(totalCategories),
        detail: 'Category groups ready to browse',
      },
    ];
  }

  addToCart(productId: number, quantity: number): void{
      if(!this.userSer.isLoggedIn()){
          this.toast.info("Plase log in to add product to cart.");
          return;
      }
      this.cartSer.addTocart(productId, quantity).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: (res) =>{
              this.toast.success('Product added to cart');
          },
          error: (err)=>{
              this.toast.error(err.error?.message ?? 'Could not add product to cart');
          }
      })
  }








  getProductImage(image: string): string {
    if (!image) {
      return this.placeholderImage;
    }

    return `http://localhost:3000${image}`;
  }

  getProductRating(product: Product): string {
    if (product.avgRating === null || product.avgRating === undefined || product.avgRating === '') {
      return 'N/A';
    }

    return String(product.avgRating);
  }

  getSoldCount(product: Product): string {
    if (product.purchaseCount === null || product.purchaseCount === undefined) {
      return '0';
    }

    return String(product.purchaseCount);
  }

  private getFieldName(value: ProductFieldValue): string {
    if (!value)     return '';
    if (typeof value === 'string')    return value;
    return value.name ?? '';
  }

  toggleProfile() {
    this.router.navigate(['profile']);
  }

  addProductPage() {
    this.router.navigate(['admin/addProduct']);
  }

  viewDetails(id: number) {
    this.router.navigate(['/user/viewDetails', id]);
  }

  viewStats(){
     this.router.navigate(['/admin/stats'])
  }

  goToCart(){
      this.router.navigate(['/user/cart']);
  }

  goToOrders(){
      this.router.navigate(['/user/orders']);
  }

  logout(){
     this.authSer.logout().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
         next: () =>{
             this.authSession.clearSession();
             this.router.navigate(['/']);
             this.toast.success('Logged out successfully')
         },
         error: (err) =>{
             this.toast.error(err.error?.message ?? 'Could not log out');
         }
     })
    }

    navigateToLogin(){
       this.router.navigate(['/auth/login']);
    }

  changeLocation() {
    this.toast.info('Location switching is not wired yet.');
  }

  private handleRouteToasts(): void {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const loginSuccess = params.get('loginSuccess') === 'true';
        const registered = params.get('registered') === 'true';

        if (!loginSuccess && !registered) {
          return;
        }

        if (loginSuccess) {
          this.toast.success('Login successful!');
        }

        if (registered) {
          this.toast.success('Registration successful!');
        }

        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { loginSuccess: null, registered: null },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      });
  }
}
