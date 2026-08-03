import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatPercentage(percentage: number, decimals: number = 2): string {
  if (isNaN(percentage)) return "0.00%";
  if (percentage > 0 && percentage < 0.01) {
    return "<0.01%";
  }
  return `${percentage.toFixed(decimals)}%`;
}
