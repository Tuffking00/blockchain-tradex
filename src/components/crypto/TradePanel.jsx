import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CRYPTO_LIST } from "./CryptoData";
import { motion } from "framer-motion";
import { ArrowUpDown } from "lucide-react";

export default function TradePanel() {
  const [side, setSide] = useState("buy");
  const [amount, setAmount] = useState("");
  const [selectedCoin, setSelectedCoin] = useState("BTC");

  const coin = CRYPTO_LIST.find((c) => c.symbol === selectedCoin);
  const total = amount && coin ? (parseFloat(amount) * coin.price).toFixed(2) : "0.00";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-card rounded-xl border border-border/50 p-5"
    >
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Quick Trade</h3>

      <div className="flex gap-1 bg-secondary/50 rounded-lg p-1 mb-5">
        <button
          onClick={() => setSide("buy")}
          className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${
            side === "buy"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setSide("sell")}
          className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${
            side === "sell"
              ? "bg-destructive text-destructive-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Sell
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Asset</label>
          <Select value={selectedCoin} onValueChange={setSelectedCoin}>
            <SelectTrigger className="bg-secondary/50 border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CRYPTO_LIST.map((c) => (
                <SelectItem key={c.symbol} value={c.symbol}>
                  <span className="flex items-center gap-2">
                    <span>{c.icon}</span>
                    <span>{c.name}</span>
                    <span className="text-muted-foreground">({c.symbol})</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Amount</label>
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-secondary/50 border-border/50"
          />
        </div>

        <div className="flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Total (USDT)</label>
          <div className="bg-secondary/50 border border-border/50 rounded-lg px-3 py-2.5 text-sm font-semibold">
            ${parseFloat(total).toLocaleString()}
          </div>
        </div>

        {coin && (
          <div className="bg-secondary/30 rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Price</span>
              <span className="font-medium">${coin.price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Fee (0.1%)</span>
              <span className="font-medium">${(parseFloat(total) * 0.001 || 0).toFixed(2)}</span>
            </div>
          </div>
        )}

        <Button
          className={`w-full font-semibold ${
            side === "buy"
              ? "bg-primary hover:bg-primary/90 text-primary-foreground"
              : "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          }`}
        >
          {side === "buy" ? "Buy" : "Sell"} {selectedCoin}
        </Button>
      </div>
    </motion.div>
  );
}