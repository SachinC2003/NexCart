import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GenericFormComponent } from '../../../shared/components/generic-form/generic-form';
import FormField from '../../../types/form.types';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthSessionService } from '../../../core/services/auth-session.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GenericFormComponent, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  constructor(
    private authSer: AuthService,
    private authSession: AuthSessionService,
    private userSer: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {}
  showToaster: boolean = false;

  loginBlueprint: FormField[] = [
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'you@example.com',
      validations: {
        required: true,
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
      }
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      placeholder: 'Enter your password',
      validations: { required: true, minLength: 6 }
    },
  ];

  handleLogin(data: any) {
    this.authSer.login(data.email, data.password, this.getDeviceName()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.authSession.setAccessToken(res.accessToken);
        this.userSer.getProfile()
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (user) => {
              if (user.role === 'admin') {
                this.router.navigate(['/admin/products'], { queryParams: { loginSuccess: true } });
                return;
              }

              this.router.navigate(['/user/products'], { queryParams: { loginSuccess: true } });
            },
            error: () => {
              this.router.navigate(['/user/products']);
            }
          });
      },
      error: (err) => {
        console.error('Login error:', err);
        this.toastr.error(err.error.message || 'Login failed. Please check your credentials.', 'Error');
      }
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const resetSuccess = params.get('resetSuccess') === 'true';

        if (!resetSuccess) {
          return;
        }

        this.toastr.success('Password reset successful! Please log in with your new password.');
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { resetSuccess: null },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      });
  }

  private getDeviceName(): string {
    const platform = navigator.platform || 'Unknown platform';
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown timezone';

    return `${platform} - ${timezone}`;
  }
}
