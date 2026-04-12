import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { EditableProductModel, ProductType } from '../../../types/entityTypes';
import { ToastrService } from 'ngx-toastr';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ImageFallback } from '../../../shared/directives/image-fallback';

@Component({
  selector: 'app-update-product',
  imports: [CommonModule, ReactiveFormsModule, ImageFallback],
  templateUrl: './update-product.html',
  styleUrl: './update-product.css',
})
export class UpdateProduct implements OnInit {
  private readonly placeholderImage = 'assets/images/placeholder.png';
  private destroyRef = inject(DestroyRef);
  updateProductForm!: FormGroup;
  productId = 0;
  loading = true;
  saving = false;
  errorMessage = '';
  taxonomy: ProductType[] = [];
  availableCategories: { label: string; value: string }[] = [];
  availableSubcategories: { label: string; value: string }[] = [];
  selectedFile: File | null = null;
  currentProduct: EditableProductModel | null = null;
  currentImageUrl = '';
  previewImageUrl = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productSer: ProductService,
    private toastr: ToastrService  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadTaxonomy();

    const typeControl = this.updateProductForm.get('type');
    const categoryControl = this.updateProductForm.get('category');

    if (typeControl) {
      typeControl.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((value) => {
          this.onTypeChange(value);
        });
    }

    if (categoryControl) {
      categoryControl.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((value) => {
          this.onCategoryChange(value);
        });
    }

    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.productId = Number(params.get('id'));
      });

    this.route.data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        const product = data['product']?.product ?? data['product'];

        if (!product) {
          this.loading = false;
          this.errorMessage = 'We could not load this product.';
          return;
        }

        this.currentProduct = product;
        this.currentImageUrl = this.buildImageUrl(product.image);
        this.populateForm(product);
        this.loading = false;
      });
  }

  initForm(): void {
    this.updateProductForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      brandName: ['', Validators.required],
      type: ['', Validators.required],
      newType: [''],
      category: ['', Validators.required],
      newCategory: [''],
      subCategory: ['', Validators.required],
      newSubCategory: [''],
      image: [''],
      price: [null, [Validators.required, Validators.min(1)]],
      discount: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      originalPrice: [null, [Validators.required, Validators.min(1)]],
      stock: [null, [Validators.required, Validators.min(0)]],
    });
  }

  loadTaxonomy(): void {
        this.productSer.getTaxonomy().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: (res) => {
            this.taxonomy = res.taxonomy ?? [];
            if (this.currentProduct) {
              this.syncExistingSelections();
            }
          },
          error: () => {
            this.errorMessage = 'Taxonomy data could not be loaded.';
          },
        })
  }

  populateForm(product: EditableProductModel): void {
    this.updateProductForm.patchValue({
      name: product.name ?? '',
      description: product.description ?? '',
      brandName: product.brandName ?? '',
      type: product.type ?? '',
      category: product.category ?? '',
      subCategory: product.subCategory ?? '',
      image: product.image ?? '',
      price: product.price ?? null,
      discount: Number(product.offer ?? 0),
      originalPrice: product.originalPrice ?? null,
      stock: product.stock ?? null,
    }, { emitEvent: false });

    this.syncExistingSelections();
  }

  syncExistingSelections(): void {
    const selectedType = this.updateProductForm.get('type')?.value;
    const selectedCategory = this.updateProductForm.get('category')?.value;

    if (!selectedType) {
      return;
    }

    const typeData = this.taxonomy.find((item) => item.name === selectedType);
    this.availableCategories = typeData
      ? (typeData.categories ?? []).map((category) => ({ label: category.name, value: category.name }))
      : [];

    if (!selectedCategory || !typeData) {
      this.availableSubcategories = [];
      return;
    }

    const categoryData = (typeData.categories ?? []).find((item) => item.name === selectedCategory);
    this.availableSubcategories = categoryData
      ? (categoryData.subCategories ?? []).map((subcategory) => ({
          label: subcategory.name,
          value: subcategory.name,
        }))
      : [];
  }

  onTypeChange(selectedType: string): void {
    this.availableCategories = [];
    this.availableSubcategories = [];
    this.updateProductForm.patchValue({ category: '', subCategory: '' }, { emitEvent: false });

    if (selectedType === 'add_new') {
      this.setValidator('newType', true);
      this.setValidator('newCategory', true);
      this.setValidator('newSubCategory', true);
      this.updateProductForm.get('category')?.clearValidators();
      this.updateProductForm.get('subCategory')?.clearValidators();
      this.updateProductForm.get('category')?.updateValueAndValidity();
      this.updateProductForm.get('subCategory')?.updateValueAndValidity();
      return;
    }

    this.setValidator('newType', false);
    this.setValidator('newCategory', false);
    this.setValidator('newSubCategory', false);
    this.updateProductForm.get('category')?.setValidators([Validators.required]);
    this.updateProductForm.get('subCategory')?.setValidators([Validators.required]);
    this.updateProductForm.get('category')?.updateValueAndValidity();
    this.updateProductForm.get('subCategory')?.updateValueAndValidity();

    const typeData = this.taxonomy.find((item) => item.name === selectedType);
    if (typeData) {
      this.availableCategories = (typeData.categories ?? []).map((category) => ({
        label: category.name,
        value: category.name,
      }));
    }
  }

  onCategoryChange(selectedCategory: string): void {
    const selectedType = this.updateProductForm.get('type')?.value;
    this.availableSubcategories = [];
    this.updateProductForm.patchValue({ subCategory: '' }, { emitEvent: false });

    if (selectedType === 'add_new') {
      return;
    }

    if (selectedCategory === 'add_new') {
      this.setValidator('newCategory', true);
      this.setValidator('newSubCategory', true);
      this.updateProductForm.get('subCategory')?.clearValidators();
      this.updateProductForm.get('subCategory')?.updateValueAndValidity();
      return;
    }

    this.setValidator('newCategory', false);
    this.setValidator('newSubCategory', false);
    this.updateProductForm.get('subCategory')?.setValidators([Validators.required]);
    this.updateProductForm.get('subCategory')?.updateValueAndValidity();

    const typeData = this.taxonomy.find((item) => item.name === selectedType);
    const categoryData = (typeData?.categories ?? []).find((item) => item.name === selectedCategory);

    if (categoryData) {
      this.availableSubcategories = (categoryData.subCategories ?? []).map((subcategory) => ({
        label: subcategory.name,
        value: subcategory.name,
      }));
    }
  }

  setValidator(controlName: string, required: boolean): void {
    const control = this.updateProductForm.get(controlName);
    if (required) {
      control?.setValidators([Validators.required]);
    } else {
      control?.clearValidators();
    }
    control?.updateValueAndValidity();
  }

  isAddNewType(): boolean {
    return this.updateProductForm.get('type')?.value === 'add_new';
  }

  isAddNewCategory(): boolean {
    return this.updateProductForm.get('category')?.value === 'add_new' || this.isAddNewType();
  }

  isAddNewSubCategory(): boolean {
    return this.updateProductForm.get('subCategory')?.value === 'add_new' || this.isAddNewCategory();
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedFile = file;
    this.previewImageUrl = file ? URL.createObjectURL(file) : '';
    this.updateProductForm.patchValue({ image: file ? file.name : this.currentProduct?.image ?? '' });
    this.updateProductForm.get('image')?.markAsTouched();
    this.updateProductForm.get('image')?.updateValueAndValidity();
  }

  handleUpdateProduct(): void {
    if (!this.updateProductForm.valid) {
      this.updateProductForm.markAllAsTouched();
      return;
    }

    const formValue = this.updateProductForm.value;
    const resolvedType = this.isAddNewType() ? formValue.newType : formValue.type;
    const resolvedCategory = this.isAddNewCategory() ? formValue.newCategory : formValue.category;
    const resolvedSubCategory = this.isAddNewSubCategory() ? formValue.newSubCategory : formValue.subCategory;

    const formData = new FormData();
    formData.append('name', formValue.name);
    formData.append('description', formValue.description);
    formData.append('brandName', formValue.brandName);
    formData.append('type', resolvedType);
    formData.append('category', resolvedCategory);
    formData.append('subCategory', resolvedSubCategory);
    formData.append('price', String(formValue.price));
    formData.append('originalPrice', String(formValue.originalPrice));
    formData.append('offer', String(formValue.discount));
    formData.append('stock', String(formValue.stock));

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.saving = true;
    this.productSer.updateProduct(this.productId, formData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: () => {
        this.toastr.success('Product updated successfully!');
        this.saving = false;
        this.router.navigate(['/admin/viewDetails', this.productId]);
      },
      error: (err) => {
        this.saving = false;
        this.toastr.error('Failed to update the product. Please try again.');
        console.error('Error updating product:', err);
        alert('Failed to update the product. Please try again.');
      },
    });
  }

  getCurrentImage(): string {
    return this.previewImageUrl || this.currentImageUrl;
  }

  buildImageUrl(image?: string): string {
    if (!image) {
      return this.placeholderImage;
    }

    if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('data:')) {
      return image;
    }

    return `http://localhost:3000${image}`;
  }

  goBack(): void {
    this.router.navigate(['/admin/viewDetails', this.productId]);
  }
}
