import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
  standalone: true,
})
export class Footer {
  readonly columns = [
    {
      title: 'Get to Know Us',
      links: [
        { label: 'About NexCart', route: '/dashboard' },
        { label: 'Admin Dashboard', route: '/dashboard' },
        { label: 'Catalog Team', route: '/admin/products' },
        { label: 'Operations', route: '/profile' },
      ],
    },
    {
      title: 'Sell With NexCart',
      links: [
        { label: 'Add a Product', route: '/admin/addProduct' },
        { label: 'Manage Listings', route: '/admin/products' },
        { label: 'Inventory Control', route: '/admin/products' },
        { label: 'Pricing Updates', route: '/admin/products' },
      ],
    },
    {
      title: 'Business Support',
      links: [
        { label: 'Account Settings', route: '/profile' },
        { label: 'Orders Workspace', route: '/admin/products' },
        { label: 'Performance View', route: '/admin/products' },
        { label: 'Reports Center', route: '/dashboard' },
      ],
    },
    {
      title: 'Let Us Help You',
      links: [
        { label: 'Support Center', route: '/profile' },
        { label: 'Update Products', route: '/admin/products' },
        { label: 'Browse Catalog', route: '/admin/products' },
        { label: 'Your Workspace', route: '/dashboard' },
      ],
    },
  ];

  readonly bottomLinks = [
    'Conditions of Use',
    'Privacy Notice',
    'Cookies Notice',
    'Interest-Based Ads',
  ];

  readonly services = [
    { title: 'NexCart Ads', text: 'Reach high-intent shoppers with commerce-first campaigns.' },
    { title: 'NexCart Supply', text: 'Keep inventory moving with visibility across categories.' },
    { title: 'NexCart Insights', text: 'Track pricing, stock, and product performance in one place.' },
    { title: 'NexCart Cloud', text: 'Power internal tools with scalable commerce infrastructure.' },
  ];

  backToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
