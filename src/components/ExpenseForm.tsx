import React, { useState, useRef } from "react";
import { PlusCircle } from "lucide-react";
import { ExpenseEntry, CATEGORIES } from "@/src/types";

interface ExpenseFormProps {
  onAdd: (entry: Omit<ExpenseEntry, "id">) => void;
}

export default function ExpenseForm({ onAdd }: ExpenseFormProps) {
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState("");
  const [isCustom, setIsCustom] = useState(false);

  const firstInputRef = useRef<HTMLSelectElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const finalCategory = isCustom ? customCategory : category;

    if (!finalCategory.trim() || !amount || !date) {
      setError("All fields are required");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Amount must be a positive number");
      return;
    }

    onAdd({
      category: finalCategory,
      amount: numAmount,
      date,
    });

    // Reset form
    setCategory("");
    setCustomCategory("");
    setAmount("");
    setDate(new Date().toISOString().split("T")[0]);
    setIsCustom(false);
    
    // Return focus
    firstInputRef.current?.focus();
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <PlusCircle className="w-5 h-5 text-rose-500" />
        Add Expense
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Category
          </label>
          {!isCustom ? (
            <select
              ref={firstInputRef}
              value={category}
              onChange={(e) => {
                if (e.target.value === "custom") {
                  setIsCustom(true);
                } else {
                  setCategory(e.target.value);
                }
              }}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
            >
              <option value="">Select Category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="custom">+ Add Custom Category</option>
            </select>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                autoFocus
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Enter category"
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setIsCustom(false)}
                className="text-xs text-slate-500 hover:text-slate-700 underline"
              >
                Back
              </button>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Amount (USD)
          </label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          className="w-full bg-rose-600 text-white py-2 rounded-lg font-medium hover:bg-rose-700 transition-colors shadow-sm"
        >
          Add Expense
        </button>
      </form>
    </div>
  );
}
