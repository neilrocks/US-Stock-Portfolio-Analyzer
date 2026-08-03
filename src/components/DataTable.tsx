import { useState, useMemo } from "react";
import { 
  Trash2, 
  Edit2, 
  TrendingUp, 
  TrendingDown, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Filter, 
  XCircle,
  Search
} from "lucide-react";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Date & Search Filter states
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "BUY" | "SELL">("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Quick Preset Handlers
  const handlePreset = (preset: "ALL" | "30DAYS" | "THIS_MONTH" | "YTD") => {
    const today = new Date();
    if (preset === "ALL") {
      setStartDate("");
      setEndDate("");
      return;
    }

    if (preset === "30DAYS") {
      const past30 = new Date();
      past30.setDate(today.getDate() - 30);
      setStartDate(past30.toISOString().split("T")[0]);
      setEndDate(today.toISOString().split("T")[0]);
    } else if (preset === "THIS_MONTH") {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(startOfMonth.toISOString().split("T")[0]);
      setEndDate(today.toISOString().split("T")[0]);
    } else if (preset === "YTD") {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      setStartDate(startOfYear.toISOString().split("T")[0]);
      setEndDate(today.toISOString().split("T")[0]);
    }
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setStartDate("");
    setEndDate("");
    setTypeFilter("ALL");
    setSearchTerm("");
    setCurrentPage(1);
  };

  const isFiltered = startDate || endDate || typeFilter !== "ALL" || searchTerm.trim();

  // Filtered dataset
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Symbol Search Filter
      if (searchTerm.trim() && !item.name.toLowerCase().includes(searchTerm.toLowerCase().trim())) {
        return false;
      }

      // Type Filter
      const itemType = item.type || "BUY";
      if (typeFilter !== "ALL" && itemType !== typeFilter) {
        return false;
      }

      // Date Range Filter
      if (startDate && item.date < startDate) {
        return false;
      }
      if (endDate && item.date > endDate) {
        return false;
      }

      return true;
    });
  }, [data, searchTerm, typeFilter, startDate, endDate]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const startIdx = (validCurrentPage - 1) * pageSize;
    return filteredData.slice(startIdx, startIdx + pageSize);
  }, [filteredData, validCurrentPage, pageSize]);

  const startRecord = filteredData.length === 0 ? 0 : (validCurrentPage - 1) * pageSize + 1;
  const endRecord = Math.min(filteredData.length, validCurrentPage * pageSize);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">View, search, and filter buy and sell stock orders</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
            {filteredData.length} {filteredData.length === 1 ? 'Record' : 'Records'} {isFiltered && `(of ${data.length})`}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Date Range Inputs */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-500 font-medium">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="focus:outline-none text-slate-700 font-medium bg-transparent cursor-pointer"
            />
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-medium">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="focus:outline-none text-slate-700 font-medium bg-transparent cursor-pointer"
            />
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => handlePreset("30DAYS")}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 font-medium transition-all"
            >
              30 Days
            </button>
            <button
              onClick={() => handlePreset("THIS_MONTH")}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 font-medium transition-all"
            >
              This Month
            </button>
            <button
              onClick={() => handlePreset("YTD")}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 font-medium transition-all"
            >
              Year to Date
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-44">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search symbol..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium uppercase"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
            <button
              onClick={() => { setTypeFilter("ALL"); setCurrentPage(1); }}
              className={`px-2 py-0.5 rounded font-medium transition-all ${
                typeFilter === "ALL" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              All
            </button>
            <button
              onClick={() => { setTypeFilter("BUY"); setCurrentPage(1); }}
              className={`px-2 py-0.5 rounded font-medium transition-all ${
                typeFilter === "BUY" ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Buys
            </button>
            <button
              onClick={() => { setTypeFilter("SELL"); setCurrentPage(1); }}
              className={`px-2 py-0.5 rounded font-medium transition-all ${
                typeFilter === "SELL" ? "bg-rose-600 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Sells
            </button>
          </div>

          {/* Reset Filters */}
          {isFiltered && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
              title="Reset all filters"
            >
              <XCircle className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Table */}
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
              {paginatedData.length === 0 ? (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-slate-400 italic"
                >
                  <td colSpan={8} className="px-6 py-8 text-center">
                    {isFiltered 
                      ? "No stock transactions found matching the selected date or filter criteria." 
                      : "No stock transactions recorded yet."}
                  </td>
                </motion.tr>
              ) : (
                paginatedData.map((item: any) => {
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

      {/* Pagination Footer */}
      {filteredData.length > 0 && (
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-700">{startRecord}</span> to{" "}
            <span className="font-semibold text-slate-700">{endRecord}</span> of{" "}
            <span className="font-semibold text-slate-700">{filteredData.length}</span> entries
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={validCurrentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-medium text-slate-600 px-2">
              Page {validCurrentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={validCurrentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
