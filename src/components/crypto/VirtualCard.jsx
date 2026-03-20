import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Copy, Lock, DollarSign, Send, Wallet, CheckCircle2, Loader2, ShieldCheck, Server, Database, RefreshCcw, UserCheck, CircleDollarSign, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const BROKER_STEPS = [
  { icon: UserCheck,        label: "Verifying account identity...",       delay: 0 },
  { icon: ShieldCheck,      label: "Running 2FA security check...",       delay: 1400 },
  { icon: Database,         label: "Fetching wallet balance...",          delay: 2600 },
  { icon: Server,           label: "Connecting to payment gateway...",    delay: 3800 },
  { icon: RefreshCcw,       label: "Processing withdrawal request...",    delay: 5000 },
  { icon: CircleDollarSign, label: "Confirming fund allocation...",       delay: 6400 },
  { icon: BadgeCheck,       label: "Withdrawal submitted successfully!",  delay: 7600 },
];

const METHOD_LABELS = {
  bank_transfer: "Bank Transfer",
  crypto_wallet: "Crypto Wallet",
  paypal: "PayPal",
  wire_transfer: "Wire Transfer",
};

export default function VirtualCard({ card }) {
  const [showNumbers, setShowNumbers] = useState(false);
  const [copied, setCopied] = useState(false);
  const [withdrawDialog, setWithdrawDialog] = useState(false);
  const [withdrawMethod, setWithdrawMethod] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [processingSteps, setProcessingSteps] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingDone, setProcessingDone] = useState(false);

  const runBrokerSequence = () => {
    if (!withdrawMethod || !withdrawAmount) {
      toast.error("Please select a method and enter an amount");
      return;
    }
    setIsProcessing(true);
    setProcessingDone(false);
    setProcessingSteps([]);
    BROKER_STEPS.forEach((step, i) => {
      setTimeout(() => {
        setProcessingSteps((prev) => [...prev, i]);
        if (i === BROKER_STEPS.length - 1) {
          base44.entities.Transaction.create({
            type: "withdrawal",
            amount: parseFloat(withdrawAmount),
            total_value: parseFloat(withdrawAmount),
            status: "pending",
            transaction_date: new Date().toISOString(),
            notes: `Withdrawal via ${METHOD_LABELS[withdrawMethod] || withdrawMethod}`,
          });
          setIsProcessing(false);
          setProcessingDone(true);
        }
      }, step.delay);
    });
  };

  const handleCloseWithdraw = () => {
    if (isProcessing) return;
    setWithdrawDialog(false);
    setWithdrawMethod("");
    setWithdrawAmount("");
    setProcessingSteps([]);
    setProcessingDone(false);
  };

  const showForm = processingSteps.length === 0 && !isProcessing && !processingDone;

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
    const statuses = [
      {
        title: "2FA Verification Required",
        description: "A verification code has been sent to your registered email.",
      },
      {
        title: "Crypto Transfer in Progress",
        description: "Your 45K profit is being transferred to your wallet.",
      }
    ];
    
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    toast.loading(`${status.title} - ${status.description}`, {
      duration: Infinity,
    });
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

        <Button
          onClick={() => setWithdrawDialog(true)}
          variant="outline"
          className="w-full border-primary/40 text-primary hover:bg-primary/10"
        >
          <Send className="w-4 h-4 mr-2" />
          Withdraw Funds
        </Button>

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

            <Button
              onClick={handleTapProfit}
              className="w-full mt-4 bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-600 text-primary-foreground font-semibold"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Tap Profit (45K)
            </Button>
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