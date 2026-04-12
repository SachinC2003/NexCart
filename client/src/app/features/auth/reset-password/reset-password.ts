import { Component, DestroyRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import FormField from '../../../types/form.types';
import { GenericFormComponent } from '../../../shared/components/generic-form/generic-form';
import { ToastrService } from 'ngx-toastr';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, GenericFormComponent, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword {
  private destroyRef = inject(DestroyRef);
  private authSer = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  constructor(private toastr : ToastrService){}
  token= this.route.snapshot.paramMap.get("token");
  isLoading = false;

  resetPasswordBlueprint: FormField[] = [
    { 
      name: 'password', 
      label: 'New password', 
      type: 'password', // Changed to password
      validations: { required: true } 
    },
    { 
      name: 'confirmPassword', 
      label: 'Confirm Password', 
      type: 'password', // Changed to password
      validations: { required: true } 
    }
  ];

  handleResetPassword(data: any) {
    if (data.password !== data.confirmPassword) {
      this.toastr.error('Passwords do not match.');
      return;
    }

    this.isLoading = true;
    
    this.authSer.resetPassword(this.token, data.password).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res: any) => {
        console.log("Password reset success:", res);
        this.router.navigate(['/auth/login'], { queryParams: { resetSuccess: true } });
      },
      error: (err) => {
        this.isLoading = false;
        console.error("Reset error:", err);
        this.toastr.error('Failed to reset password. The link may be expired or invalid.');
      }
    });
  }
}
