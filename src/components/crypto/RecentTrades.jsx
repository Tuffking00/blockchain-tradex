import React from "react";
import { RECENT_TRADES } from "./CryptoData";
import { motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

export default function RecentTrades() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-card rounded-xl border border-border/50 p-5"
    >
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Recent Trades</h3>
      <div className="space-y-3">
        {RECENT_TRADES.map((trade, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-2 border-b border-border/20 last:border-0"
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                trade.type === "buy" ? "bg-primary/10" : "bg-destructive/10"
              }`}>
                {trade.type === "buy" ? (
                  <ArrowDownLeft className="w-4 h-4 text-primary" />
                ) : (
                  <ArrowUpRight className="w-4 h-4 text-destructive" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold">{trade.pair}</p>
                <p className="text-xs text-muted-foreground">{trade.time}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm font-semibold ${
                trade.type === "buy" ? "text-primary" : "text-destructive"
              }`}>
                {trade.type === "buy" ? "+" : "-"}{trade.amount}
              </p>
              <p className="text-xs text-muted-foreground">
                @${trade.price.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}