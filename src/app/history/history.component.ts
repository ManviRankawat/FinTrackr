import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ExpenseService } from '../services/expense.service';
import { Expense } from '../models/expense.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit, OnDestroy {
  expenses: Expense[] = [];
  filteredExpenses: Expense[] = [];
  
  // Filter properties
  searchTerm = '';
  selectedCategory = '';
  selectedMonth = '';
  sortBy = 'date'; // 'date', 'amount', 'category', 'description'
  sortDirection = 'desc'; // 'asc', 'desc'
  
  private subscription: Subscription = new Subscription();

  constructor(private expenseService: ExpenseService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.expenseService.getExpenses().subscribe(expenses => {
        this.expenses = expenses;
        this.applyFilters();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // Get available categories for filter dropdown
  get categories() {
    return this.expenseService.categories;
  }

  // Get available months from existing expenses
  get availableMonths(): string[] {
    const months = new Set<string>();
    this.expenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.add(monthYear);
    });
    return Array.from(months).sort().reverse();
  }

  // Apply all filters and sorting
  applyFilters(): void {
    let filtered = [...this.expenses];

    // Search filter
    if (this.searchTerm) {
      filtered = filtered.filter(expense =>
        expense.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(expense => expense.category === this.selectedCategory);
    }

    // Month filter
    if (this.selectedMonth) {
      filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.date);
        const expenseMonth = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
        return expenseMonth === this.selectedMonth;
      });
    }

    // Apply sorting
    this.sortExpenses(filtered);
  }

  // Sort expenses based on selected criteria
  sortExpenses(expenses: Expense[]): void {
    expenses.sort((a, b) => {
      let comparison = 0;

      switch (this.sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'description':
          comparison = a.description.localeCompare(b.description);
          break;
      }

      return this.sortDirection === 'asc' ? comparison : -comparison;
    });

    this.filteredExpenses = expenses;
  }

  // Handle sort change
  onSortChange(sortBy: string): void {
    if (this.sortBy === sortBy) {
      // Toggle direction if same column
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // New column, default to descending
      this.sortBy = sortBy;
      this.sortDirection = 'desc';
    }
    this.applyFilters();
  }

  // Clear all filters
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedMonth = '';
    this.sortBy = 'date';
    this.sortDirection = 'desc';
    this.applyFilters();
  }

  // Delete expense with confirmation
  deleteExpense(expense: Expense): void {
    const confirmMessage = `Are you sure you want to delete this expense?\n\n${expense.description} - ${this.formatCurrency(expense.amount)}`;
    
    if (confirm(confirmMessage)) {
      this.expenseService.deleteExpense(expense.id);
    }
  }

  // Format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  // Format date
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Get category info
  getCategoryInfo(categoryName: string) {
    return this.expenseService.getCategoryInfo(categoryName);
  }

  // Get total of filtered expenses
  get filteredTotal(): number {
    return this.filteredExpenses.reduce((total, expense) => total + expense.amount, 0);
  }
}