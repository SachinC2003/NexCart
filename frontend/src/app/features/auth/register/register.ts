import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { GenericFormComponent } from '../../../shared/components/generic-form/generic-form';
import FormField from '../../../types/form.types';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthSessionService } from '../../../core/services/auth-session.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GenericFormComponent, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {
  private destroyRef = inject(DestroyRef);
  constructor(private authSer : AuthService, 
              private authSession: AuthSessionService,
              private router: Router,
              private toastSer: ToastrService){}

  registerBlueprint: FormField[] = [
      {
        name: 'name',
        label: 'Full Name',
        type: 'text',
        placeholder: 'Sachin Kumar',
        validations: { required: true, minLength: 3 }
      },
      {
        name: 'email',
        label: 'Email',
        type: 'email',
        placeholder: 'you@example.com',
        validations: { required: true, pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' }
      },
      {
        name: 'phoneNumber',
        label: 'Phone Number',
        type: 'text',
        placeholder: '+91 98765 43210',
        validations: { required: true, pattern: '^[0-9+()\\-\\s]{8,20}$' }
      },
      { 
        name: 'password', 
        label: 'Password', 
        type: 'password', 
        placeholder: 'Create a strong password',
        validations: { required: true, minLength: 6} 
      }
    ];
  
  handleRegister(data: any) {
    
    this.authSer.register(data.name, data.email, data.password, data.phoneNumber, this.getDeviceName()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (res) => {
          this.authSession.setAccessToken(res.accessToken);
          if(data.email === "admin@gmail.com"){
              this.router.navigate(['/admin/products'], { queryParams: { registered: true } });
          }else{
            this.router.navigate(['/user/products'], { queryParams: { registered: true } });
          }
        },
        error: (err) => {
          console.error("Register error:", err);
          this.toastSer.error(err.error.message || "Registration failed. Please try again.");
        }
      });
  }

  private getDeviceName(): string {
    const platform = navigator.platform || 'Unknown platform';
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown timezone';

    return `${platform} - ${timezone}`;
  }
}
