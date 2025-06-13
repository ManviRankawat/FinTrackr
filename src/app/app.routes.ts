import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AddExpenseComponent } from './add-expense/add-expense.component';
import { HistoryComponent } from './history/history.component';
import { AnalyticsComponent } from './analytics/analytics.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'add-expense', component: AddExpenseComponent },
  { path: 'history', component: HistoryComponent },
  { path: 'analytics', component: AnalyticsComponent },
  { path: '**', redirectTo: '' }
];