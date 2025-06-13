import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from './services/theme.service';
import { ToastService, Toast } from './services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'finance-tracker';
  isDarkTheme = false;
  toasts: Toast[] = [];
  private subscription = new Subscription();

  constructor(
    private themeService: ThemeService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.themeService.isDarkTheme$.subscribe(isDark => {
        this.isDarkTheme = isDark;
      })
    );

    this.subscription.add(
      this.toastService.toasts$.subscribe(toasts => {
        this.toasts = toasts;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  removeToast(id: string): void {
    this.toastService.remove(id);
  }
}