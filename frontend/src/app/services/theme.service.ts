import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkTheme = new BehaviorSubject<boolean>(false);
  isDarkTheme$ = this.isDarkTheme.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Only initialize theme in browser environment
    if (isPlatformBrowser(this.platformId)) {
      this.loadTheme();
    }
  }

  toggleTheme(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const newTheme = !this.isDarkTheme.value;
    this.isDarkTheme.next(newTheme);
    this.saveTheme(newTheme);
    this.applyTheme(newTheme);
  }

  private loadTheme(): void {
    try {
      const savedTheme = localStorage.getItem('finance-tracker-theme');
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;
      
      this.isDarkTheme.next(isDark);
      this.applyTheme(isDark);
    } catch (error) {
      // Fallback if localStorage is not available
      console.warn('localStorage not available, using default theme');
      this.isDarkTheme.next(false);
      this.applyTheme(false);
    }
  }

  private saveTheme(isDark: boolean): void {
    try {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('finance-tracker-theme', isDark ? 'dark' : 'light');
      }
    } catch (error) {
      console.warn('Could not save theme preference');
    }
  }

  private applyTheme(isDark: boolean): void {
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }
  }
}