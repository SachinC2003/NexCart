import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { ProductType } from '../../../types/entityTypes';
import { ToastrService } from 'ngx-toastr';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-product',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-product.html',
  styleUrl: './add-product.css',
})
export class AddProduct implements OnInit {
  private destroyRef = inject(DestroyRef);
  addProductForm!: FormGroup;
  taxonomy: ProductType[] = [];
  availableCategories: { label: string; value: string }[] = [];
  availableSubcategories: { label: string; value: string }[] = [];

  constructor(private fb: FormBuilder, 
              private productSer: ProductService,
              private toast: ToastrService,
              private router: Router
  ) {}

  ngOnInit() {
    this.addProductForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      brandName: ['', Validators.required],
      type: ['', Validators.required],
      newType: [''],
      category: ['', Validators.required],
      newCategory: [''],
      subCategory: ['', Validators.required],
      newSubCategory: [''],
      image: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(1)]],
      discount: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      originalPrice: [null, [Validators.required, Validators.min(1)]],
      stock: [null, [Validators.required, Validators.min(0)]],
    });

    this.loadTaxonomy();

    this.addProductForm.get('type')?.valueChanges
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe((value) => {
      this.onTypeChange(value);
    });

    this.addProductForm.get('category')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.onCategoryChange(value);
      });
  }

  loadTaxonomy() {
    this.productSer.getTaxonomy()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.taxonomy = res.taxonomy ?? [];
      });
  }

  onTypeChange(selectedType: string) {
    // Reset downstream fields
    this.availableCategories = [];
    this.availableSubcategories = [];
    this.addProductForm.patchValue({ category: '', subCategory: '' });

    if (selectedType === 'add_new') {
      // New type → all downstream must also be new
      this.setValidator('newType', true);
      this.setValidator('newCategory', true);
      this.setValidator('newSubCategory', true);
      // Override category/subCategory required since user fills newCategory/newSubCategory
      this.addProductForm.get('category')?.clearValidators();
      this.addProductForm.get('category')?.updateValueAndValidity();
      this.addProductForm.get('subCategory')?.clearValidators();
      this.addProductForm.get('subCategory')?.updateValueAndValidity();
    } else {
      this.setValidator('newType', false);
      this.setValidator('newCategory', false);
      this.setValidator('newSubCategory', false);
      // Restore required on category & subCategory
      this.addProductForm.get('category')?.setValidators([Validators.required]);
      this.addProductForm.get('category')?.updateValueAndValidity();
      this.addProductForm.get('subCategory')?.setValidators([Validators.required]);
      this.addProductForm.get('subCategory')?.updateValueAndValidity();

      const typeData = this.taxonomy.find((t) => t.name === selectedType);
      if (typeData) {
        this.availableCategories = (typeData.categories ?? []).map((c) => ({
          label: c.name,
          value: c.name,
        }));
      }
    }
  }

  onCategoryChange(selectedCategory: string) {
    const selectedType = this.addProductForm.get('type')?.value;

    // Reset subcategory
    this.availableSubcategories = [];
    this.addProductForm.patchValue({ subCategory: '' });

    if (selectedType === 'add_new') {
      // Already handled in onTypeChange — nothing extra needed
      return;
    }

    if (selectedCategory === 'add_new') {
      // New category → subCategory must also be new
      this.setValidator('newCategory', true);
      this.setValidator('newSubCategory', true);
      this.addProductForm.get('subCategory')?.clearValidators();
      this.addProductForm.get('subCategory')?.updateValueAndValidity();
    } else {
      this.setValidator('newCategory', false);
      this.setValidator('newSubCategory', false);
      this.addProductForm.get('subCategory')?.setValidators([Validators.required]);
      this.addProductForm.get('subCategory')?.updateValueAndValidity();

      const typeData = this.taxonomy.find((t) => t.name === selectedType);
      const catData = (typeData?.categories ?? []).find((c) => c.name === selectedCategory);
      if (catData) {
        this.availableSubcategories = (catData.subCategories ?? []).map((s) => ({
          label: s.name,
          value: s.name,
        }));
      }
    }
  }

  private setValidator(controlName: string, required: boolean) {
    const control = this.addProductForm.get(controlName);
    if (required) {
      control?.setValidators([Validators.required]);
    } else {
      control?.clearValidators();
    }
    control?.updateValueAndValidity();
  }

  isAddNewType(): boolean {
    return this.addProductForm.get('type')?.value === 'add_new';
  }

  isAddNewCategory(): boolean {
    return this.addProductForm.get('category')?.value === 'add_new' || this.isAddNewType();
  }

  isAddNewSubCategory(): boolean {
    return this.addProductForm.get('subCategory')?.value === 'add_new' || this.isAddNewCategory();
  }

  selectedFile: File | null = null;

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedFile = file;
    this.addProductForm.patchValue({ image: file ? file.name : '' });
    this.addProductForm.get('image')?.markAsTouched();
    this.addProductForm.get('image')?.updateValueAndValidity();
  }

  handleAddProduct() {
    if (this.addProductForm.valid && this.selectedFile) {
      const formValue = this.addProductForm.value;
      const formData = new FormData();

      // 1. Resolve Taxonomy
      const resolvedType = this.isAddNewType() ? formValue.newType : formValue.type;
      const resolvedCategory = this.isAddNewCategory() ? formValue.newCategory : formValue.category;
      const resolvedSubCategory = this.isAddNewSubCategory() ? formValue.newSubCategory : formValue.subCategory;

      // 2. Append the File (Crucial: the key 'image' must match Multer's upload.single('image'))
      formData.append('image', this.selectedFile);

      // 3. Append all other text fields
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

      // 4. Send formData (NOT productData)
      this.productSer.addProduct(formData)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
        next: (res) => {
          this.toast.success('Product added successfully!');
          console.log('Product added successfully:', res);
          this.addProductForm.reset();
          this.availableCategories = [];
          this.availableSubcategories = [];
          this.selectedFile = null; // Clear the file
          this.router.navigate(['admin/products']);
        },
        error: (err) => {
          this.toast.error('Failed to add product. Please try agian')
          console.error('Error adding product:', err)},
      });
    } else {
      this.addProductForm.markAllAsTouched();
      if(!this.selectedFile) {
        this.toast.error('Please select an image.');
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/products']);
  }
}
