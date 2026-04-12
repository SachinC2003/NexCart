import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { Observable, finalize, of, tap } from 'rxjs';
import { User } from '../../types/auth.types';
import { GenericFormComponent } from '../../shared/components/generic-form/generic-form';
import FormField from '../../types/form.types';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GenericFormComponent, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
    private destroyRef = inject(DestroyRef);
    editMode: boolean = false;
    isSaving = false;
    currentUser: User | null = null;
    user$: Observable<User>;
    editProfileBlueprint: FormField[] = [];

    constructor(
        private userSer : UserService,
        private toastSer: ToastrService
    ){
        this.user$ = this.loadProfile();
    }

    loadProfile(): Observable<User> {
        return this.userSer.getProfile().pipe(
            tap(user => {
                this.currentUser = user;
                this.setEditProfileBlueprint(user);
            })
        );
    }

    toggleEdit(user?: User){
        const profileUser = user ?? this.currentUser;

        if (profileUser) {
            this.setEditProfileBlueprint(profileUser);
        }

        this.editMode = !this.editMode;
    }

    cancelEdit() {
        if (this.currentUser) {
            this.setEditProfileBlueprint(this.currentUser);
        }

        this.editMode = false;
    }

    backToProduct(){
        window.history.back();
    }

    editProfile(formData: { name: string; phoneNumber: string; location: string }) {
        if (this.isSaving) {
            return;
        }

        const payload = {
            name: formData.name.trim(),
            phoneNumber: formData.phoneNumber.trim(),
            location: formData.location.trim() || null,
        };

        this.isSaving = true;

        this.userSer.updateProfile(payload).pipe(
            takeUntilDestroyed(this.destroyRef),
            finalize(() => {
                this.isSaving = false;
            })
        ).subscribe({
            next: updatedUser => {
                this.currentUser = updatedUser;
                this.setEditProfileBlueprint(updatedUser);
                this.user$ = of(updatedUser);
                this.editMode = false;
                this.toastSer.success('Profile updated successfully.', 'Success');
            },
            error: error => {
                console.error('Failed to update profile', error);
                this.toastSer.error('Profile update failed. Please try again.', 'Error');
            }
        });
    }

    private setEditProfileBlueprint(user: User) {
        this.editProfileBlueprint = [
            {
                name: 'name',
                label: 'Full Name',
                type: 'text',
                placeholder: 'Sachin Kumar',
                initialValue: user.name,
                validations: { required: true, minLength: 3 }
            },
            {
                name: 'phoneNumber',
                label: 'Phone Number',
                type: 'text',
                placeholder: '+91 98765 43210',
                initialValue: user.phoneNumber,
                validations: { required: true, pattern: '^[0-9+()\\-\\s]{8,20}$' }
            },
            {
                name: 'location',
                label: 'Location',
                type: 'text',
                placeholder: 'Enter your city or region',
                initialValue: user.location ?? ''
            }
        ];
    }
}
