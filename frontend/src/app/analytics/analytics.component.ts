import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ExpenseService } from '../services/expense.service';
import { Expense } from '../models/expense.model';
import { Subscription } from 'rxjs';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('categoryChart', { static: true }) categoryChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('monthlyChart', { static: true }) monthlyChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('trendChart', { static: true }) trendChartRef!: ElementRef<HTMLCanvasElement>;

  expenses: Expense[] = [];
  private subscription: Subscription = new Subscription();
  
  // Charts
  private categoryChart: Chart | null = null;
  private monthlyChart: Chart | null = null;
  private trendChart: Chart | null = null;

  // Analytics data
  totalExpenses = 0;
  currentMonthTotal = 0;
  previousMonthTotal = 0;
  averageDaily = 0;
  topCategory = '';
  monthlyGrowth = 0;

  // Predictions (simulated AI)
  predictedNextMonth = 0;
  budgetRecommendation = 0;
  savingsOpportunity = 0;

  constructor(private expenseService: ExpenseService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.expenseService.getExpenses().subscribe(expenses => {
        this.expenses = expenses;
        this.calculateAnalytics();
        this.generatePredictions();
      })
    );
  }

  ngAfterViewInit(): void {
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      this.createCharts();
    }, 100);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.destroyCharts();
  }

  private calculateAnalytics(): void {
    if (this.expenses.length === 0) return;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Total expenses
    this.totalExpenses = this.expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Current month total
    this.currentMonthTotal = this.expenses
      .filter(expense => {
        const date = new Date(expense.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);

    // Previous month total
    this.previousMonthTotal = this.expenses
      .filter(expense => {
        const date = new Date(expense.date);
        return date.getMonth() === previousMonth && date.getFullYear() === previousYear;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);

    // Monthly growth
    if (this.previousMonthTotal > 0) {
      this.monthlyGrowth = ((this.currentMonthTotal - this.previousMonthTotal) / this.previousMonthTotal) * 100;
    }

    // Average daily spending (current month)
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    this.averageDaily = this.currentMonthTotal / daysInMonth;

    // Top category
    this.topCategory = this.expenseService.getMostSpentCategory();

    // Update charts
    this.updateCharts();
  }

  private generatePredictions(): void {
    if (this.expenses.length < 2) return;

    // Simple trend-based prediction
    const trend = this.monthlyGrowth / 100;
    this.predictedNextMonth = this.currentMonthTotal * (1 + trend);

    // Budget recommendation (20% above current average)
    this.budgetRecommendation = this.currentMonthTotal * 1.2;

    // Savings opportunity (find category with highest variance)
    const categoryTotals = this.getCategoryTotals();
    const maxCategory = Math.max(...Object.values(categoryTotals));
    this.savingsOpportunity = maxCategory * 0.15; // 15% reduction opportunity
  }

  private createCharts(): void {
    this.createCategoryChart();
    this.createMonthlyChart();
    this.createTrendChart();
  }

  private createCategoryChart(): void {
    const categoryTotals = this.getCategoryTotals();
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    const colors = labels.map(category => 
      this.expenseService.getCategoryInfo(category).color
    );

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed;
                const total = context.dataset.data.reduce((sum: number, val) => sum + (val as number), 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${this.formatCurrency(value)} (${percentage}%)`;
              }
            }
          }
        }
      }
    };

    this.categoryChart = new Chart(this.categoryChartRef.nativeElement, config);
  }

  private createMonthlyChart(): void {
    const monthlyData = this.getMonthlyData();
    
    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: monthlyData.labels,
        datasets: [{
          label: 'Monthly Expenses',
          data: monthlyData.values,
          backgroundColor: 'rgba(102, 126, 234, 0.8)',
          borderColor: 'rgba(102, 126, 234, 1)',
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `Expenses: ${this.formatCurrency(context.parsed.y)}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => this.formatCurrency(value as number)
            }
          }
        }
      }
    };

    this.monthlyChart = new Chart(this.monthlyChartRef.nativeElement, config);
  }

  private createTrendChart(): void {
    const trendData = this.getTrendData();
    
    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: trendData.labels,
        datasets: [{
          label: 'Spending Trend',
          data: trendData.values,
          borderColor: 'rgba(118, 75, 162, 1)',
          backgroundColor: 'rgba(118, 75, 162, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgba(118, 75, 162, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `Amount: ${this.formatCurrency(context.parsed.y)}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => this.formatCurrency(value as number)
            }
          }
        }
      }
    };

    this.trendChart = new Chart(this.trendChartRef.nativeElement, config);
  }

  private updateCharts(): void {
    if (this.categoryChart) {
      this.destroyCharts();
      setTimeout(() => this.createCharts(), 100);
    }
  }

  private destroyCharts(): void {
    if (this.categoryChart) {
      this.categoryChart.destroy();
      this.categoryChart = null;
    }
    if (this.monthlyChart) {
      this.monthlyChart.destroy();
      this.monthlyChart = null;
    }
    if (this.trendChart) {
      this.trendChart.destroy();
      this.trendChart = null;
    }
  }

  private getCategoryTotals(): { [key: string]: number } {
    const totals: { [key: string]: number } = {};
    this.expenses.forEach(expense => {
      totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
    });
    return totals;
  }

  private getMonthlyData(): { labels: string[], values: number[] } {
    const monthlyTotals: { [key: string]: number } = {};
    
    this.expenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + expense.amount;
    });

    const sortedMonths = Object.keys(monthlyTotals).sort();
    const labels = sortedMonths.map(month => {
      const [year, monthNum] = month.split('-');
      const date = new Date(parseInt(year), parseInt(monthNum) - 1);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    });
    const values = sortedMonths.map(month => monthlyTotals[month]);

    return { labels, values };
  }

  private getTrendData(): { labels: string[], values: number[] } {
    // Group expenses by week for trend analysis
    const weeklyTotals: { [key: string]: number } = {};
    
    this.expenses.forEach(expense => {
      const date = new Date(expense.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      weeklyTotals[weekKey] = (weeklyTotals[weekKey] || 0) + expense.amount;
    });

    const sortedWeeks = Object.keys(weeklyTotals).sort().slice(-8); // Last 8 weeks
    const labels = sortedWeeks.map(week => {
      const date = new Date(week);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    const values = sortedWeeks.map(week => weeklyTotals[week]);

    return { labels, values };
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatPercentage(value: number): string {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  }

  get hasData(): boolean {
    return this.expenses.length > 0;
  }
}