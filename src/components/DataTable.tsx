import { Trash2, Edit2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface DataTableProps<T> {
  title: string;
  data: T[];
  type: "stock" | "expense";
  onDelete: (id: string) => void;
  onEdit?: (id: string) => void;
}

export default function DataTable<T extends { id: string; amount: number; date: string; name?: string; category?: string }>({
  title,
  data,
  type,
  onDelete,
  onEdit,
}: DataTableProps<T>) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-50">
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <th className="px-6 py-3 font-medium">{type === "stock" ? "Stock" : "Category"}</th>
              <th className="px-6 py-3 font-medium">Invested</th>
              {type === "stock" && (
                <>
                  <th className="px-6 py-3 font-medium">Purchase Price</th>
                  <th className="px-6 py-3 font-medium">Current Price</th>
                  <th className="px-6 py-3 font-medium">Return</th>
                </>
              )}
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
                  <td colSpan={type === "stock" ? 6 : 4} className="px-6 py-8 text-center">
                    No entries yet.
                  </td>
                </motion.tr>
              ) : (
                data.map((item: any) => (
                  <motion.tr
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {type === "stock" ? item.name : item.category}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {formatCurrency(item.amount)}
                    </td>
                    {type === "stock" && (
                      <>
                        <td className="px-6 py-4 text-slate-600">
                          {item.purchasePrice ? formatCurrency(item.purchasePrice) : "---"}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {item.currentPrice ? formatCurrency(item.currentPrice) : "---"}
                        </td>
                        <td className={`px-6 py-4 font-medium ${
                          (item.return || 0) >= 0 ? "text-emerald-600" : "text-rose-600"
                        }`}>
                          {item.return !== undefined ? `${item.return >= 0 ? "+" : ""}${item.return.toFixed(2)}%` : "---"}
                        </td>
                      </>
                    )}
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {formatDate(item.date)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(item.id)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onDelete(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
