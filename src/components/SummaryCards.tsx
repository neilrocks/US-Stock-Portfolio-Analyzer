import { TrendingUp, ArrowUpRight, DollarSign, Wallet } from "lucide-react";
import { formatCurrency } from "@/src/lib/utils";
import { motion } from "motion/react";

interface SummaryCardsProps {
  totalInvestment: number;
  totalSales?: number;
  totalPortfolioValue: number;
}

export default function SummaryCards({ 
  totalInvestment, 
  totalSales = 0, 
  totalPortfolioValue 
}: SummaryCardsProps) {
  const netCapitalInvested = Math.max(0, totalInvestment - totalSales);
  const totalReturn = netCapitalInvested > 0 ? ((totalPortfolioValue - netCapitalInvested) / netCapitalInvested) * 100 : 0;

  const cards = [
    {
      title: "Current Portfolio Value",
      value: totalPortfolioValue,
      icon: Wallet,
      color: "text-blue-600",
      bg: "bg-blue-50",
      subValue: `${totalReturn >= 0 ? "+" : ""}${totalReturn.toFixed(2)}% Net Return`
    },
    {
      title: "Net Capital Invested",
      value: netCapitalInvested,
      icon: DollarSign,
      color: "text-slate-700",
      bg: "bg-slate-100",
      subText: "Buys minus Sells"
    },
    {
      title: "Total Purchases (Buys)",
      value: totalInvestment,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      subText: "Gross capital spent"
    },
    {
      title: "Realized Sales Proceeds",
      value: totalSales,
      icon: ArrowUpRight,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      subText: "Total sell cash received"
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
              <p className={`text-xs font-semibold mt-1 ${totalReturn >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {card.subValue}
              </p>
            )}
            {card.subText && (
              <p className="text-[11px] text-slate-400 mt-1 font-normal">
                {card.subText}
              </p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
