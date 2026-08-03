import { Trash2, Edit2, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency, formatDate } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface DataTableProps<T> {
  title: string;
  data: T[];
  onDelete: (id: string) => void;
  onEdit?: (id: string) => void;
}

export default function DataTable<T extends { 
  id: string; 
  name: string; 
  type?: "BUY" | "SELL";
  amount: number; 
  purchasePrice?: number;
  salePrice?: number;
  currentPrice?: number;
  return?: number;
  date: string; 
}>({
  title,
  data,
  onDelete,
  onEdit,
}: DataTableProps<T>) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-50 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
          {data.length} {data.length === 1 ? 'Record' : 'Records'}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <th className="px-6 py-3 font-medium">Stock Symbol</th>
              <th className="px-6 py-3 font-medium">Type</th>
              <th className="px-6 py-3 font-medium">Total Amount</th>
              <th className="px-6 py-3 font-medium">Trans. Price</th>
              <th className="px-6 py-3 font-medium">Current Price</th>
              <th className="px-6 py-3 font-medium">Return / Gain</th>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            <AnimatePresence mode="popLayout">
              {data.length === 0 ? (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-slate-400 italic"
                >
                  <td colSpan={8} className="px-6 py-8 text-center">
                    No stock transactions recorded yet.
                  </td>
                </motion.tr>
              ) : (
                data.map((item: any) => {
                  const isSell = item.type === "SELL";
                  const unitPrice = isSell ? item.salePrice : item.purchasePrice;

                  return (
                    <motion.tr
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                        {item.name}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          isSell ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                        }`}>
                          {isSell ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                          {isSell ? "SELL" : "BUY"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {unitPrice ? formatCurrency(unitPrice) : "---"}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {item.currentPrice ? formatCurrency(item.currentPrice) : "---"}
                      </td>
                      <td className={`px-6 py-4 font-semibold ${
                        isSell 
                          ? "text-slate-500"
                          : ((item.return || 0) >= 0 ? "text-emerald-600" : "text-rose-600")
                      }`}>
                        {isSell 
                          ? "Realized" 
                          : (item.return !== undefined ? `${item.return >= 0 ? "+" : ""}${item.return.toFixed(2)}%` : "---")
                        }
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm">
                        {formatDate(item.date)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {onEdit && (
                            <button
                              onClick={() => onEdit(item.id)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              title="Edit Transaction"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => onDelete(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="Delete Transaction"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
