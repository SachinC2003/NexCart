import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../core/services/auth.service';
import { AuthSessionService } from '../../core/services/auth-session.service';
import { Theme } from '../../core/services/theme.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent {
  showToaster = false;
  private queryParamSubscription: any;
//   featuredProducts = [
//     { name: 'Luna Carry', category: 'Travel', price: '$128', accent: 'Best Seller' },
//     { name: 'Verve Watch', category: 'Accessories', price: '$214', accent: 'New Arrival' },
//     { name: 'Cloud Knit', category: 'Fashion', price: '$96', accent: 'Editor Pick' },
//   ];

//   stats = [
//     { value: '24h', label: 'dispatch on selected collections' },
//     { value: '4.9/5', label: 'average satisfaction from verified buyers' },
//     { value: '30k+', label: 'shoppers exploring the store every month' },
//   ];

//   stats = [
//   { label: 'Active Users', value: '12k+' },
//   { label: 'Premium Products', value: '450+' },
//   { label: 'City Deliveries', value: '24/7' }
// ];

stats = [
  { label: 'Active Users', value: '12k+' },
  { label: 'Premium Products', value: '450+' },
  { label: 'City Deliveries', value: '24/7' }
];

featuredProducts = [
  { 
    name: 'ZenFlex Pro Yoga Mat', 
    category: 'Fitness / Accessories', 
    price: 'Rs. 1,499', 
    accent: 'Best Seller' 
  },
  { 
    name: 'Adjustable Dumbbell Set', 
    category: 'Fitness / Equipment', 
    price: 'Rs. 4,999', 
    accent: 'New Arrival' 
  },
  { 
    name: 'Eco-Grip Foam Roller', 
    category: 'Fitness / Recovery', 
    price: 'Rs. 899', 
    accent: 'Trending' 
  }
];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    public theme: Theme,
    private authSer: AuthService,
    private authSession: AuthSessionService
  ) {
    this.queryParamSubscription = this.route.queryParamMap.subscribe((params) => {
      if (params.get('loginSuccess') === 'true') {
        this.toastr.success('Login successful!', 'Success');
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { loginSuccess: null },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      }
    });
  }

  logout() {
    this.authSer.logout().subscribe({
      next: () => {
        this.authSession.clearSession();
      },
      error: () => {
        this.authSession.clearSession();
      },
    });
  }

  toggleTheme() {
    this.theme.toggleTheme();
  }

  ngOnDestroy(){
    if (this.queryParamSubscription) {
      this.queryParamSubscription.unsubscribe();
    }
  }
}

