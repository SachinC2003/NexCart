import { Component, DestroyRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import FormField from '../../../types/form.types';
import { AuthService } from '../../../core/services/auth.service';
import { GenericFormComponent } from '../../../shared/components/generic-form/generic-form';
import { ToastrService } from 'ngx-toastr';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, GenericFormComponent, RouterLink, CommonModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  private destroyRef = inject(DestroyRef);
  constructor(private authSer : AuthService,
              private toastr: ToastrService
  ){}
  
  isLoading = false;
  sendMailBlueprint: FormField[] = [
    { 
      name: 'email', 
      label: 'Email', 
      type: 'text', 
      validations: { required: true } 
    }
  ];

  handleSendMail(data: any) {
    console.log("Clean Data Received:", data);
    this.isLoading = true;

    this.authSer.forgotPassword(data.email).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.toastr.success('Password reset email sent successfully!');
        },
        error: (err) => {
          this.toastr.error(err.error.message || 'Failed to send password reset email.');
          console.error("Email send error:", err);
        },
        complete:()=>{
           this.isLoading = false;
        }
      });
  }
}
