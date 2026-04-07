import React, { useState, useRef } from "react";
import { PlusCircle } from "lucide-react";
import { StockEntry } from "@/src/types";

interface StockFormProps {
  onAdd: (entry: Omit<StockEntry, "id">) => void;
}

export default function StockForm({ onAdd }: StockFormProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState("");
  
  const firstInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !amount || !purchasePrice || !date) {
      setError("All fields are required");
      return;
    }

    const numAmount = parseFloat(amount);
    const numPurchasePrice = parseFloat(purchasePrice);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Amount must be a positive number");
      return;
    }

    if (isNaN(numPurchasePrice) || numPurchasePrice <= 0) {
      setError("Purchase price must be a positive number");
      return;
    }

    onAdd({
      name: name.toUpperCase(),
      amount: numAmount,
      purchasePrice: numPurchasePrice,
      date,
    });

    // Reset form
    setName("");
    setAmount("");
    setPurchasePrice("");
    setDate(new Date().toISOString().split("T")[0]);
    
    // Return focus
    firstInputRef.current?.focus();
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <PlusCircle className="w-5 h-5 text-blue-500" />
        Add Stock Investment
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Stock Name (e.g. AAPL)
          </label>
          <input
            ref={firstInputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="AAPL"
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Amount Invested (Total USD)
          </label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Purchase Price (Per Share)
          </label>
          <input
            type="number"
            step="0.01"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            placeholder="0.00"
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          Add Entry
        </button>
      </form>
    </div>
  );
}
