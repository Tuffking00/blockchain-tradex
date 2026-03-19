import React from "react";
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Activity } from "lucide-react";
import { PORTFOLIO_TOTAL, PORTFOLIO_CHANGE_24H, PORTFOLIO_PNL } from "./CryptoData";
import { motion } from "framer-motion";

const stats = [
  {
    label: "Portfolio Value",
    value: `$${PORTFOLIO_TOTAL.toLocaleString()}`,
    change: `+${PORTFOLIO_CHANGE_24H}%`,
    isPositive: true,
    icon: DollarSign,
  },
  {
    label: "24h P&L",
    value: `+$${PORTFOLIO_PNL.toLocaleString()}`,
    change: `+${PORTFOLIO_CHANGE_24H}%`,
    isPositive: true,
    icon: TrendingUp,
  },
  {
    label: "Total Trades",
    value: "1,247",
    change: "+12 today",
    isPositive: true,
    icon: BarChart3,
  },
  {
    label: "Win Rate",
    value: "67.4%",
    change: "+2.1%",
    isPositive: true,
    icon: Activity,
  },
];

export default function PortfolioStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-card rounded-xl p-5 border border-border/50 hover:border-primary/30 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <stat.icon className="w-4 h-4 text-primary" />
            </div>
          </div>
          <p className="text-2xl font-bold">{stat.value}</p>
          <div className="flex items-center gap-1 mt-1">
            {stat.isPositive ? (
              <TrendingUp className="w-3 h-3 text-primary" />
            ) : (
              <TrendingDown className="w-3 h-3 text-destructive" />
            )}
            <span className={`text-xs font-medium ${stat.isPositive ? "text-primary" : "text-destructive"}`}>
              {stat.change}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}