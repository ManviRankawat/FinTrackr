import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ExpenseService } from '../services/expense.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-add-expense',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './add-expense.component.html',
  styleUrls: ['./add-expense.component.css']
})
export class AddExpenseComponent implements OnInit {
  expenseForm: FormGroup;
  isSubmitting = false;

  constructor(
    private formBuilder: FormBuilder,
    private expenseService: ExpenseService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.expenseForm = this.formBuilder.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      category: ['', Validators.required],
      description: ['', Validators.required],
      date: [new Date().toISOString().split('T')[0], Validators.required]
    });
  }

  ngOnInit(): void {
  }

  get categories() {
    return this.expenseService.categories;
  }

  onSubmit() {
    if (this.expenseForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      
      try {
        const expenseData = {
          amount: parseFloat(this.expenseForm.value.amount),
          category: this.expenseForm.value.category,
          description: this.expenseForm.value.description,
          date: this.expenseForm.value.date
        };

        this.expenseService.addExpense(expenseData);
        
        // Show success toast
        this.toastService.showSuccess('💰 Expense added successfully!');
        
        // Reset form
        this.expenseForm.reset();
        this.expenseForm.patchValue({
          date: new Date().toISOString().split('T')[0]
        });

        // Navigate back after short delay
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1500);

      } catch (error) {
        this.toastService.showError('Failed to add expense. Please try again.');
      } finally {
        this.isSubmitting = false;
      }
    } else if (!this.expenseForm.valid) {
      Object.keys(this.expenseForm.controls).forEach(key => {
        this.expenseForm.get(key)?.markAsTouched();
      });
      this.toastService.showError('Please fill in all required fields correctly.');
    }
  }

  hasError(fieldName: string): boolean {
    const field = this.expenseForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.expenseForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['min']) return `Amount must be greater than 0`;
    }
    return '';
  }
}