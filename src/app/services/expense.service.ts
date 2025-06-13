import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Expense, Category } from '../models/expense.model';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private readonly STORAGE_KEY = 'finance-tracker-expenses';
  
  private expensesSubject = new BehaviorSubject<Expense[]>([]);
  expenses$ = this.expensesSubject.asObservable();

  categories: Category[] = [
    { name: 'Food & Dining', emoji: '🍽️', color: '#FF6B6B' },
    { name: 'Transportation', emoji: '🚗', color: '#4ECDC4' },
    { name: 'Shopping', emoji: '🛍️', color: '#45B7D1' },
    { name: 'Entertainment', emoji: '🎬', color: '#96CEB4' },
    { name: 'Bills & Utilities', emoji: '💡', color: '#FFA07A' },
    { name: 'Healthcare', emoji: '🏥', color: '#DDA0DD' },
    { name: 'Education', emoji: '📚', color: '#98D8C8' },
    { name: 'Travel', emoji: '✈️', color: '#F7DC6F' },
    { name: 'Other', emoji: '📦', color: '#D3D3D3' }
  ];

  constructor() {
    this.loadExpensesFromStorage();
  }

  getExpenses(): Observable<Expense[]> {
    return this.expenses$;
  }

  addExpense(expenseData: Omit<Expense, 'id' | 'createdAt'>): void {
    const newExpense: Expense = {
      ...expenseData,
      id: this.generateId(),
      createdAt: new Date()
    };

    const currentExpenses = this.expensesSubject.value;
    const updatedExpenses = [...currentExpenses, newExpense];
    
    this.expensesSubject.next(updatedExpenses);
    this.saveExpensesToStorage(updatedExpenses);
  }

  deleteExpense(id: string): void {
    const currentExpenses = this.expensesSubject.value;
    const updatedExpenses = currentExpenses.filter(expense => expense.id !== id);
    
    this.expensesSubject.next(updatedExpenses);
    this.saveExpensesToStorage(updatedExpenses);
  }

  getCurrentMonthTotal(): number {
    const currentExpenses = this.expensesSubject.value;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return currentExpenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === currentMonth && 
               expenseDate.getFullYear() === currentYear;
      })
      .reduce((total, expense) => total + expense.amount, 0);
  }

  getMostSpentCategory(): string {
    const currentExpenses = this.expensesSubject.value;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyExpenses = currentExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && 
             expenseDate.getFullYear() === currentYear;
    });

    if (monthlyExpenses.length === 0) return 'No data yet';

    const categoryTotals: { [key: string]: number } = {};
    monthlyExpenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    const topCategory = Object.keys(categoryTotals).reduce((a, b) => 
      categoryTotals[a] > categoryTotals[b] ? a : b
    );

    return topCategory;
  }

  getCategoryInfo(categoryName: string): Category {
    return this.categories.find(cat => cat.name === categoryName) || 
           { name: categoryName, emoji: '📦', color: '#D3D3D3' };
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  private loadExpensesFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const expenses = JSON.parse(stored);
        this.expensesSubject.next(expenses);
      }
    } catch (error) {
      console.error('Error loading expenses from storage:', error);
    }
  }

  private saveExpensesToStorage(expenses: Expense[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(expenses));
    } catch (error) {
      console.error('Error saving expenses to storage:', error);
    }
  }
}