import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Theme {
  private currentTheme = 'light';
  private readonly storageKey = 'storefront-theme';

  constructor() {
    this.initializeTheme();
  }

  initializeTheme() {
    const storedTheme = localStorage.getItem(this.storageKey);
    const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    this.setTheme(storedTheme ?? preferredTheme);
  }

  setTheme(theme: string) {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.storageKey, theme);
  }

  toggleTheme() {
    this.setTheme(this.currentTheme === 'light' ? 'dark' : 'light');
  }

  getTheme(): string {
    return this.currentTheme;
  }
}
