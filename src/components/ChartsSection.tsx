import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { COLORS } from "@/src/types";
import { formatCurrency, formatPercentage } from "@/src/lib/utils";
import { Percent, DollarSign } from "lucide-react";

interface ChartsSectionProps {
  stockData: { name: string; value: number }[];
  summaryData: { name: string; value: number }[];
  trendData: { date: string; investments: number; sales: number }[];
  viewMode: "amount" | "percentage";
  onToggleViewMode: () => void;
}

export default function ChartsSection({
  stockData,
  summaryData,
  trendData,
  viewMode,
  onToggleViewMode,
}: ChartsSectionProps) {
  const totalStockValue = stockData.reduce((sum, s) => sum + s.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const percentage = totalStockValue > 0 ? (value / totalStockValue) * 100 : 0;

      return (
        <div className="bg-white p-3 border border-slate-100 shadow-lg rounded-lg">
          <p className="text-sm font-semibold text-slate-900">{payload[0].name}</p>
          <p className="text-sm text-blue-600 font-bold">
            {viewMode === "amount" ? formatCurrency(value) : formatPercentage(percentage)}
          </p>
          {viewMode === "amount" && (
            <p className="text-xs text-slate-400">
              {formatPercentage(percentage)} of total
            </p>
          )}
          {viewMode === "percentage" && (
            <p className="text-xs text-slate-400">
              Value: {formatCurrency(value)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ data, colors }: { data: { name: string; value: number }[], colors: string[] }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    return (
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {data.map((entry, index) => {
          const percentage = total > 0 ? (entry.value / total) * 100 : 0;
          return (
            <div key={entry.name} className="flex items-center gap-2 group">
              <div 
                className="w-3 h-3 rounded-full shrink-0" 
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-slate-700 truncate" title={entry.name}>
                  {entry.name}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {formatPercentage(percentage)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Active Stock Allocation */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Stock Allocation</h3>
            <p className="text-xs text-slate-400">Percentage share of active holdings</p>
          </div>
          <button
            onClick={onToggleViewMode}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-all"
            title={`Switch to ${viewMode === "amount" ? "Percentage" : "Amount"} View`}
          >
            {viewMode === "amount" ? (
              <><Percent className="w-3 h-3" /> Percentage View</>
            ) : (
              <><DollarSign className="w-3 h-3" /> Amount View</>
            )}
          </button>
        </div>
        <div className="h-[240px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <PieChart>
              <Pie
                data={stockData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                labelLine={false}
              >
                {stockData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                content={<CustomTooltip />} 
                animationDuration={300}
                animationEasing="ease-out"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <CustomLegend data={stockData} colors={COLORS} />
      </div>

      {/* Portfolio Value vs Realized Sales */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
        <div className="mb-6">
          <h3 className="text-lg font-semibold">Capital Allocation Overview</h3>
          <p className="text-xs text-slate-400">Active holdings vs realized sales proceeds</p>
        </div>
        <div className="h-[240px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <PieChart>
              <Pie
                data={summaryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                <Cell fill="#3b82f6" />
                <Cell fill="#6366f1" />
              </Pie>
              <Tooltip 
                content={<CustomTooltip />} 
                animationDuration={300}
                animationEasing="ease-out"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <CustomLegend data={summaryData} colors={["#3b82f6", "#6366f1"]} />
      </div>

      {/* Yearly Stock Activity Trend */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
        <div className="mb-6">
          <h3 className="text-lg font-semibold">Yearly Stock Transaction Trend</h3>
          <p className="text-xs text-slate-400">Total stock purchases (buys) vs realized sales (proceeds)</p>
        </div>
        <div className="h-[300px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="top" align="right" height={36} />
              <Line
                type="monotone"
                dataKey="investments"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6 }}
                name="Purchases (Buys)"
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6 }}
                name="Realized Sales Proceeds"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
