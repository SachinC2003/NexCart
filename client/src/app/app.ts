import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet, NavigationEnd} from '@angular/router';
import { CommonModule } from '@angular/common';
import { Theme } from './core/services/theme.service';
import { Footer } from './features/footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true
})
export class App {
  protected readonly title = signal('folderStructure-demo');
  constructor(public theme: Theme, private router: Router) {
    this.theme.initializeTheme();
  }

  get isAuthPage(): boolean {
    return this.router.url.includes('/auth');
  }
  toggleTheme() {
    this.theme.toggleTheme();
  }
}
