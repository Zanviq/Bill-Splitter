export interface Person {
  id: string;
  name: string;
}

export interface ExpenseItem {
  id: string;
  name: string;
  price: number;
  sharedBy: string[]; // Array of Person IDs
}

export interface ReceiptItem {
  name: string;
  amount: number;
  originalPrice: number;
  sharerCount: number;
}

export enum AppStep {
  SETUP = 'SETUP',
  CALCULATOR = 'CALCULATOR',
}