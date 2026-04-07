import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { StockEntry, ExpenseEntry, CATEGORIES } from "@/src/types";

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updatedData: any) => void;
  entry: StockEntry | ExpenseEntry | null;
  type: "stock" | "expense";
}

export default function EditModal({ isOpen, onClose, onSave, entry, type }: EditModalProps) {
  const [formData, setFormData] = useState<any>({});
  const [error, setError] = useState("");

  useEffect(() => {
    if (entry) {
      setFormData(entry);
      setError("");
    }
  }, [entry]);

  if (!entry) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (type === "stock") {
      if (!formData.name?.trim() || !formData.amount || !formData.purchasePrice || !formData.date) {
        setError("All fields are required");
        return;
      }
      if (isNaN(formData.amount) || formData.amount <= 0) {
        setError("Amount must be a positive number");
        return;
      }
      if (isNaN(formData.purchasePrice) || formData.purchasePrice <= 0) {
        setError("Purchase price must be a positive number");
        return;
      }
    } else {
      if (!formData.category || !formData.amount || !formData.date) {
        setError("All fields are required");
        return;
      }
      if (isNaN(formData.amount) || formData.amount <= 0) {
        setError("Amount must be a positive number");
        return;
      }
    }

    onSave(entry.id, formData);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Edit {type === "stock" ? "Stock" : "Expense"}</h3>
              <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {type === "stock" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Stock Symbol</label>
                    <input
                      type="text"
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Purchase Price (Per Share)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.purchasePrice || ""}
                      onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                    <select
                      value={formData.category || ""}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount || ""}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date || ""}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
