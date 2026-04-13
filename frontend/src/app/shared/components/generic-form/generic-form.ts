import { Component, DestroyRef, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import FormField from '../../../types/form.types';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-generic-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './generic-form.html',
  styleUrl: './generic-form.css'
})
export class GenericFormComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  @Input() fields: FormField[] = [];
  @Input() submitLabel = 'Submit';
  @Output() formSubmit = new EventEmitter<any>();

  form!: FormGroup;
  showNewInputs: { [key: string]: boolean } = {};

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.form = this.createControl();
  }

  // Logic to turn your "fields" array into a real Angular FormGroup
  createControl() {
    const group = this.fb.group({});
    this.fields.forEach(field => {
      const controlValidators = [];
      if (field.validations?.required) controlValidators.push(Validators.required);
      if (field.validations?.minLength) controlValidators.push(Validators.minLength(field.validations.minLength));
      if (field.validations?.pattern) controlValidators.push(Validators.pattern(field.validations.pattern));

      group.addControl(field.name, this.fb.control(field.initialValue || '', controlValidators));

      if (field.allowAddNew && field.newFieldName) {
        group.addControl(field.newFieldName, this.fb.control(''));
        this.showNewInputs[field.name] = false;

        // Subscribe to changes
        group.get(field.name)?.valueChanges
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(value => {
            this.showNewInputs[field.name] = value === 'add_new';
            this.updateNewFieldValidator(field, value === 'add_new');
          });
      }
    });
    return group;
  }

  updateNewFieldValidator(field: FormField, required: boolean) {
    if (field.newFieldName) {
      const control = this.form.get(field.newFieldName);
      if (required) {
        control?.setValidators([Validators.required]);
      } else {
        control?.clearValidators();
      }
      control?.updateValueAndValidity();
    }
  }

  onSubmit() {
    if (this.form.valid) {
      const value = this.form.value;
      // Process the value to use new fields if add_new selected
      this.fields.forEach(field => {
        if (field.allowAddNew && field.newFieldName && value[field.name] === 'add_new') {
          value[field.name] = value[field.newFieldName];
          delete value[field.newFieldName];
        }
      });
      this.formSubmit.emit(value);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
