import { Directive, Input, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: 'img[appImageFallback]', // Restrict to img tags
  standalone: true
})
export class ImageFallback {
  // Allow passing a specific fallback URL, or use a default one
  @Input('appImageFallback') fallbackUrl: string = 'assets/images/placeholder.png';

  constructor(private el: ElementRef) {}

  @HostListener('error')
  onError() {
    const element: HTMLImageElement = this.el.nativeElement;
    element.src = this.fallbackUrl || 'assets/images/placeholder.png';
  }
}