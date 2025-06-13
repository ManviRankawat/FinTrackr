import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-add-expense',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './add-expense.component.html',
  styleUrl: './add-expense.component.css'
})
export class AddExpenseComponent implements OnInit{
  expenseForm: FormGroup;
  categories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Education',
    'Travel',
    'Other'
  ];

  constructor(private formBuilder: FormBuilder) { 
    this.expenseForm = this.formBuilder.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      category: ['', Validators.required],
      description: ['', Validators.required],
      date: [new Date().toISOString().split('T')[0], Validators.required]
    });
  }

  ngOnInit(): void {
  }

  onSubmit() {
    if (this.expenseForm.valid) {
      const expenseData = this.expenseForm.value;
      console.log('New Expense:', expenseData);
      
      // TODO: Save to storage (we'll do this next)
      alert('Expense added successfully!');
      this.expenseForm.reset();
      this.expenseForm.patchValue({
        date: new Date().toISOString().split('T')[0]
      });
    } else {
      alert('Please fill in all required fields correctly!');
    }
  }

  // Helper method to check if a field has errors
  hasError(fieldName: string): boolean {
    const field = this.expenseForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  // Get error message for a field
  getErrorMessage(fieldName: string): string {
    const field = this.expenseForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['min']) return `${fieldName} must be greater than 0`;
    }
    return '';
  }
}
