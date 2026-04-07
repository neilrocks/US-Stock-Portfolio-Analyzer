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
import { formatCurrency } from "@/src/lib/utils";
import { Percent, DollarSign } from "lucide-react";

interface ChartsSectionProps {
  stockData: { name: string; value: number }[];
  expenseData: { name: string; value: number }[];
  summaryData: { name: string; value: number }[];
  trendData: { date: string; investments: number; expenses: number }[];
  viewMode: "amount" | "percentage";
  onToggleViewMode: () => void;
}

export default function ChartsSection({
  stockData,
  expenseData,
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
          <p className="text-sm text-blue-600">
            {viewMode === "amount" ? formatCurrency(value) : `${percentage.toFixed(1)}%`}
          </p>
          {viewMode === "amount" && (
            <p className="text-xs text-slate-400">
              {percentage.toFixed(1)}% of total
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
                  {percentage.toFixed(1)}%
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
      {/* Stock Allocation */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Stock Allocation</h3>
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
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
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

      {/* Expense Breakdown */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
        <h3 className="text-lg font-semibold mb-6">Expense Breakdown</h3>
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expenseData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {expenseData.map((_, index) => (
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
        <CustomLegend data={expenseData} colors={COLORS} />
      </div>

      {/* Investment vs Expenses */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
        <h3 className="text-lg font-semibold mb-6">Investment vs Expenses</h3>
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
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
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip 
                content={<CustomTooltip />} 
                animationDuration={300}
                animationEasing="ease-out"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <CustomLegend data={summaryData} colors={["#3b82f6", "#ef4444"]} />
      </div>

      {/* Yearly Trend */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold mb-6">Yearly Trend</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
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
                name="Investments"
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6 }}
                name="Expenses"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
