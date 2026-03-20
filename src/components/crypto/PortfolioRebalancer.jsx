import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sliders, TrendingUp, TrendingDown, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PortfolioRebalancer({ cryptoList }) {
  const [expanded, setExpanded] = useState(false);
  const [targets, setTargets] = useState({});

  const portfolioTotal = useMemo(
    () => cryptoList.reduce((sum, c) => sum + c.price * c.holdings, 0),
    [cryptoList]
  );

  // Build current allocations
  const current = useMemo(() =>
    cryptoList.map((c) => ({
      symbol: c.symbol,
      name: c.name,
      icon: c.icon,
      price: c.price,
      holdings: c.holdings,
      valueUSD: c.price * c.holdings,
      currentPct: portfolioTotal > 0 ? (c.price * c.holdings / portfolioTotal) * 100 : 0,
    })),
    [cryptoList, portfolioTotal]
  );

  const totalTargetPct = useMemo(() =>
    current.reduce((sum, c) => sum + (parseFloat(targets[c.symbol]) || 0), 0),
    [targets, current]
  );

  const suggestions = useMemo(() => {
    return current.map((c) => {
      const targetPct = parseFloat(targets[c.symbol]) || 0;
      const targetValue = (targetPct / 100) * portfolioTotal;
      const diffUSD = targetValue - c.valueUSD;
      const diffCoins = c.price > 0 ? diffUSD / c.price : 0;
      return { ...c, targetPct, targetValue, diffUSD, diffCoins };
    }).filter((c) => c.targetPct > 0 || c.currentPct > 0);
  }, [current, targets, portfolioTotal]);

  const handleReset = () => {
    const equal = (100 / current.length).toFixed(1);
    const t = {};
    current.forEach((c) => { t[c.symbol] = equal; });
    setTargets(t);
  };

  return (
    <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sliders className="w-4 h-4 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold">Portfolio Rebalancer</p>
            <p className="text-xs text-muted-foreground">Set target allocations to get trade suggestions</p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4">
              {/* Total indicator */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Total target: <span className={`font-semibold ${Math.abs(totalTargetPct - 100) < 0.5 ? "text-primary" : "text-yellow-400"}`}>{totalTargetPct.toFixed(1)}%</span>
                  {Math.abs(totalTargetPct - 100) >= 0.5 && <span className="ml-1 text-yellow-400">(should sum to 100%)</span>}
                </span>
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={handleReset}>
                  <RefreshCw className="w-3 h-3" /> Equal Split
                </Button>
              </div>

              {/* Target inputs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {current.map((c) => (
                  <div key={c.symbol} className="space-y-1">
                    <label className="text-xs text-muted-foreground flex items-center gap-1">
                      <span>{c.icon}</span> {c.symbol}
                      <span className="ml-auto text-[10px] text-muted-foreground/60">{c.currentPct.toFixed(1)}% now</span>
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        placeholder="0"
                        value={targets[c.symbol] ?? ""}
                        onChange={(e) => setTargets((prev) => ({ ...prev, [c.symbol]: e.target.value }))}
                        className="bg-secondary/50 border-border h-8 text-sm pr-6"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Suggestions table */}
              {suggestions.some((s) => s.targetPct > 0) && (
                <div className="mt-2 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Suggested Trades</p>
                  <div className="rounded-lg border border-border/50 overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-secondary/30 text-muted-foreground">
                          <th className="text-left px-3 py-2 font-medium">Asset</th>
                          <th className="text-right px-3 py-2 font-medium">Current</th>
                          <th className="text-right px-3 py-2 font-medium">Target</th>
                          <th className="text-right px-3 py-2 font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {suggestions.filter((s) => s.targetPct > 0).map((s, i) => {
                          const needsBuy = s.diffUSD > 0.5;
                          const needsSell = s.diffUSD < -0.5;
                          const balanced = !needsBuy && !needsSell;
                          return (
                            <tr key={s.symbol} className={`border-t border-border/30 ${i % 2 === 0 ? "" : "bg-secondary/10"}`}>
                              <td className="px-3 py-2.5 font-medium">
                                <span className="mr-1.5">{s.icon}</span>{s.symbol}
                              </td>
                              <td className="px-3 py-2.5 text-right text-muted-foreground">{s.currentPct.toFixed(1)}%</td>
                              <td className="px-3 py-2.5 text-right">{s.targetPct.toFixed(1)}%</td>
                              <td className="px-3 py-2.5 text-right">
                                {balanced ? (
                                  <span className="text-primary font-medium">✓ Balanced</span>
                                ) : (
                                  <span className={`font-semibold flex items-center justify-end gap-1 ${needsBuy ? "text-primary" : "text-destructive"}`}>
                                    {needsBuy ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                    {needsBuy ? "Buy" : "Sell"} {Math.abs(s.diffCoins).toFixed(4)} {s.symbol}
                                    <span className="text-muted-foreground font-normal ml-1">(${Math.abs(s.diffUSD).toLocaleString(undefined, { maximumFractionDigits: 0 })})</span>
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}