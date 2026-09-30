import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  isDark = signal<boolean>(false);

  toggle() {
    this.isDark.update(v => !v);

    // ✅ protéger pour SSR
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute(
        'data-theme',
        this.isDark() ? 'dark' : 'light'
      );
    }
  }

  init() {
    // ✅ protéger pour SSR
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }
}
