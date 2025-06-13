export interface Expense {
    id: string;
    amount: number;
    category: string;
    description: string;
    date: string;
    createdAt: Date;
  }
  
  export interface Category {
    name: string;
    emoji: string;
    color: string;
  }