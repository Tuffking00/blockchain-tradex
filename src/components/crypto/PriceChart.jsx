import React, { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { CHART_DATA } from "./CryptoData";
import { motion } from "framer-motion";

const timeframes = ["1H", "4H", "1D", "1W", "1M"];

export default function PriceChart() {
  const [activeTimeframe, setActiveTimeframe] = useState("1D");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card rounded-xl border border-border/50 p-5"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">BTC / USDT</h3>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-3xl font-bold">$87,432.18</span>
            <span className="text-sm font-medium text-primary">+2.34%</span>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setActiveTimeframe(tf)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTimeframe === tf
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={CHART_DATA}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(215, 14%, 50%)", fontSize: 11 }}
            />
            <YAxis
              domain={["dataMin - 500", "dataMax + 500"]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(215, 14%, 50%)", fontSize: 11 }}
              tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(220, 18%, 7%)",
                border: "1px solid hsl(220, 16%, 14%)",
                borderRadius: "12px",
                color: "hsl(210, 20%, 95%)",
                fontSize: 13,
              }}
              formatter={(value) => [`$${value.toLocaleString()}`, "Price"]}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="hsl(142, 71%, 45%)"
              strokeWidth={2}
              fill="url(#priceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}