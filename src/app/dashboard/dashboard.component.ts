import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../services/expense.service';
import { Expense } from '../models/expense.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  expenses: Expense[] = [];
  totalExpenses = 0;
  mostSpentCategory = 'No data yet';
  private subscription: Subscription = new Subscription();

  constructor(private expenseService: ExpenseService) {}

  ngOnInit(): void {
    // Subscribe to expense changes
    this.subscription.add(
      this.expenseService.getExpenses().subscribe(expenses => {
        this.expenses = expenses;
        this.updateDashboardData();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private updateDashboardData(): void {
    this.totalExpenses = this.expenseService.getCurrentMonthTotal();
    this.mostSpentCategory = this.expenseService.getMostSpentCategory();
  }

  // Get recent expenses (last 5)
  get recentExpenses(): Expense[] {
    return this.expenses
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }

  // Format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  // Get category emoji
  getCategoryEmoji(categoryName: string): string {
    return this.expenseService.getCategoryInfo(categoryName).emoji;
  }
}