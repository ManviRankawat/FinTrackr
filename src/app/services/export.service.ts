import { Injectable } from '@angular/core';
import { Expense } from '../models/expense.model';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  exportToCSV(expenses: Expense[], filename = 'expenses.csv'): void {
    const headers = ['Date', 'Category', 'Description', 'Amount'];
    const csvContent = [
      headers.join(','),
      ...expenses.map(expense => [
        expense.date,
        `"${expense.category}"`,
        `"${expense.description}"`,
        expense.amount
      ].join(','))
    ].join('\n');

    this.downloadFile(csvContent, filename, 'text/csv');
  }

  exportToJSON(expenses: Expense[], filename = 'expenses.json'): void {
    const jsonContent = JSON.stringify(expenses, null, 2);
    this.downloadFile(jsonContent, filename, 'application/json');
  }

  generateExpenseReport(expenses: Expense[]): string {
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const categoryTotals: { [key: string]: number } = {};
    
    expenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    const sortedCategories = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a);

    let report = `EXPENSE REPORT\n`;
    report += `Generated: ${new Date().toLocaleDateString()}\n`;
    report += `Total Expenses: $${totalExpenses.toFixed(2)}\n`;
    report += `Number of Transactions: ${expenses.length}\n\n`;
    
    report += `CATEGORY BREAKDOWN:\n`;
    sortedCategories.forEach(([category, amount]) => {
      const percentage = ((amount / totalExpenses) * 100).toFixed(1);
      report += `${category}: $${amount.toFixed(2)} (${percentage}%)\n`;
    });

    report += `\nDETAILED TRANSACTIONS:\n`;
    report += `Date\t\tCategory\t\tDescription\t\tAmount\n`;
    expenses
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .forEach(expense => {
        report += `${expense.date}\t${expense.category}\t${expense.description}\t$${expense.amount.toFixed(2)}\n`;
      });

    return report;
  }

  exportReport(expenses: Expense[], filename = 'expense-report.txt'): void {
    const report = this.generateExpenseReport(expenses);
    this.downloadFile(report, filename, 'text/plain');
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}