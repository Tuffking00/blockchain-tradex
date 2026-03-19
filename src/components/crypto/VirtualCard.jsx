import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Copy, Lock, DollarSign, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VirtualCard({ card }) {
  const [showNumbers, setShowNumbers] = useState(false);
  const [copied, setCopied] = useState(false);
  const [withdrawalPending, setWithdrawalPending] = useState(false);

  const maskCardNumber = (num) => {
    const last4 = num.slice(-4);
    return `•••• •••• •••• ${last4}`;
  };

  const displayNumber = showNumbers ? card.card_number : maskCardNumber(card.card_number);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(card.card_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const spendingPercent = (card.spending_today / card.daily_limit) * 100;

  const handleTapProfit = () => {
    setWithdrawalPending(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="relative group"
    >
      {/* Gradient background card */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/10 rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 rounded-2xl p-6 text-white overflow-hidden border border-indigo-500/20 shadow-2xl h-64 flex flex-col justify-between">
        {/* Background pattern */}
        <div className="absolute top-0 right-0 w-40 h-40 opacity-10">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="30" fill="none" stroke="white" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="20" fill="none" stroke="white" strokeWidth="0.5" />
          </svg>
        </div>

        {/* Top section */}
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium opacity-75 uppercase tracking-wider">Blockchain Tradex</p>
            <p className="text-lg font-bold mt-1">Virtual Card</p>
          </div>
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-cyan-400/30 to-blue-400/30 rounded-lg backdrop-blur-sm border border-cyan-400/20">
          <Lock className="w-6 h-6 text-cyan-300" />
          </div>
        </div>

        {/* Middle section - Card number */}
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-medium opacity-75 uppercase tracking-wider">Card Number</p>
              <p className="text-xl font-mono font-semibold tracking-wider mt-1">{displayNumber}</p>
            </div>
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowNumbers(!showNumbers)}
                className="h-8 w-8 hover:bg-cyan-400/20 text-cyan-300"
              >
                {showNumbers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={copyToClipboard}
                className="h-8 w-8 hover:bg-cyan-400/20 text-cyan-300"
                title="Copy card number"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom section - Expiry and balance */}
        <div className="relative z-10 flex items-end justify-between">
          <div className="space-y-2">
            <div>
              <p className="text-xs font-medium opacity-75 uppercase tracking-wider">Expires</p>
              <p className="text-lg font-semibold font-mono">{card.expiry_date}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium opacity-75 uppercase tracking-wider">Balance</p>
            <p className="text-lg font-bold">${card.balance.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Card details below */}
      <div className="mt-4 space-y-3 bg-card rounded-xl p-4 border border-border/50">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Cardholder</span>
          <span className="text-sm font-semibold">{card.card_holder}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Daily Limit</span>
          <span className="text-sm font-semibold">${card.daily_limit.toLocaleString()}</span>
        </div>

        {/* Spending bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Today's Spending</span>
            <span className="text-xs font-semibold text-muted-foreground">
              ${card.spending_today.toLocaleString()} / ${card.daily_limit.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-secondary/50 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all rounded-full ${
                spendingPercent > 80 ? "bg-destructive" : "bg-primary"
              }`}
              style={{ width: `${Math.min(spendingPercent, 100)}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <span className="text-xs text-muted-foreground">Status</span>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${card.is_active ? "bg-primary" : "bg-destructive"}`} />
            <span className="text-xs font-semibold">
              {card.is_active ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {card.card_type === "premium" && (
          <div className="mt-4 pt-4 border-t border-border/30 space-y-2">
            <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Premium Advantages</p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5">✓</span>
                <span>45K Welcome Bonus Profit</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5">✓</span>
                <span>Up to 5M Daily Trading Limit</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5">✓</span>
                <span>Advanced Market Access</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5">✓</span>
                <span>Priority Trade Execution</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5">✓</span>
                <span>Reduced Trading Fees</span>
              </li>
            </ul>

            {!withdrawalPending ? (
              <Button
                onClick={handleTapProfit}
                className="w-full mt-4 bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-600 text-primary-foreground font-semibold"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Tap Profit (45K)
              </Button>
            ) : (
              <div className="w-full mt-4 bg-secondary/50 rounded-lg p-3 flex items-center gap-3">
                <Clock className="w-4 h-4 text-accent animate-spin" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-foreground">Withdrawal Pending</p>
                  <p className="text-xs text-muted-foreground">Your 45K profit is being processed</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {copied && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium">
          Card number copied!
        </div>
      )}
    </motion.div>
  );
}