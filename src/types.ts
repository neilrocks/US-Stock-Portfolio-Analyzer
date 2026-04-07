/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface StockEntry {
  id: string;
  name: string;
  amount: number;
  purchasePrice: number;
  date: string;
}

export interface ExpenseEntry {
  id: string;
  category: string;
  amount: number;
  date: string;
}

export interface FinanceData {
  stocks: StockEntry[];
  expenses: ExpenseEntry[];
}

export const CATEGORIES = [
  "Food",
  "Rent",
  "Travel",
  "Entertainment",
  "Healthcare",
  "Utilities",
  "Shopping",
  "Other"
];

export const COLORS = [
  "#3b82f6", // blue-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#ef4444", // red-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#06b6d4", // cyan-500
  "#f97316", // orange-500
];
