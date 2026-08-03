import React, { useState, useRef } from "react";
import { TrendingDown } from "lucide-react";
import { StockEntry } from "@/src/types";

interface SellStockFormProps {
  onAdd: (entry: Omit<StockEntry, "id">) => void;
  existingStocks?: string[];
}

export default function SellStockForm({ onAdd, existingStocks = [] }: SellStockFormProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState("");
  
  const firstInputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !amount || !salePrice || !date) {
      setError("All fields are required");
      return;
    }

    const numAmount = parseFloat(amount);
    const numSalePrice = parseFloat(salePrice);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Total sale proceeds must be a positive number");
      return;
    }

    if (isNaN(numSalePrice) || numSalePrice <= 0) {
      setError("Sale price must be a positive number");
      return;
    }

    onAdd({
      name: name.toUpperCase(),
      type: "SELL",
      amount: numAmount,
      salePrice: numSalePrice,
      date,
    });

    // Reset form
    setName("");
    setAmount("");
    setSalePrice("");
    setDate(new Date().toISOString().split("T")[0]);
    
    // Return focus
    firstInputRef.current?.focus();
  };

  const uniqueExisting = Array.from(new Set(existingStocks.map(s => s.toUpperCase())));

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-rose-600">
          <TrendingDown className="w-5 h-5 text-rose-500" />
          Track Stock Sale
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Stock Name / Symbol
            </label>
            {uniqueExisting.length > 0 ? (
              <div className="space-y-2">
                <input
                  ref={firstInputRef as any}
                  type="text"
                  list="existing-stocks-list"
                  value={name}
                  onChange={(e) => setName(e.target.value.toUpperCase())}
                  placeholder="e.g. AAPL"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all uppercase"
                />
                <datalist id="existing-stocks-list">
                  {uniqueExisting.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>
            ) : (
              <input
                ref={firstInputRef as any}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value.toUpperCase())}
                placeholder="e.g. AAPL"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all uppercase"
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Total Sale Proceeds (USD)
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
              Sale Price (Per Share USD)
            </label>
            <input
              type="number"
              step="0.01"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Sale Date
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
            Record Sale
          </button>
        </form>
      </div>
    </div>
  );
}
