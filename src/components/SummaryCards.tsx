import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { formatCurrency } from "@/src/lib/utils";
import { motion } from "motion/react";

interface SummaryCardsProps {
  totalInvestment: number;
  totalExpenses: number;
  totalPortfolioValue: number;
}

export default function SummaryCards({ totalInvestment, totalExpenses, totalPortfolioValue }: SummaryCardsProps) {
  const netBalance = totalPortfolioValue - totalExpenses;
  const totalReturn = totalInvestment > 0 ? ((totalPortfolioValue - totalInvestment) / totalInvestment) * 100 : 0;

  const cards = [
    {
      title: "Invested Capital",
      value: totalInvestment,
      icon: TrendingUp,
      color: "text-slate-600",
      bg: "bg-slate-50",
    },
    {
      title: "Portfolio Value",
      value: totalPortfolioValue,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      subValue: `${totalReturn >= 0 ? "+" : ""}${totalReturn.toFixed(2)}% Return`
    },
    {
      title: "Total Expenses",
      value: totalExpenses,
      icon: TrendingDown,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      title: "Net Worth",
      value: netBalance,
      icon: Wallet,
      color: netBalance >= 0 ? "text-blue-600" : "text-orange-600",
      bg: netBalance >= 0 ? "bg-blue-50" : "bg-orange-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between"
        >
          <div className="flex items-center space-x-4 mb-2">
            <div className={`${card.bg} p-3 rounded-xl`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
            <p className="text-sm font-medium text-slate-500">{card.title}</p>
          </div>
          <div>
            <p className={`text-2xl font-bold ${card.color}`}>
              {formatCurrency(card.value)}
            </p>
            {card.subValue && (
              <p className={`text-xs font-semibold mt-1 ${totalReturn >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                {card.subValue}
              </p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
