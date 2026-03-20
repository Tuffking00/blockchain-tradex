import React from "react";
import PriceChart from "@/components/crypto/PriceChart";
import PortfolioStats from "@/components/crypto/PortfolioStats";
import TradePanel from "@/components/crypto/TradePanel";
import RecentTrades from "@/components/crypto/RecentTrades";
import { useLivePrices } from "@/hooks/useLivePrices";

export default function Dashboard() {
  const { cryptoList, portfolioTotal, portfolioChange24h, isLoading } = useLivePrices();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <PortfolioStats portfolioTotal={portfolioTotal} portfolioChange24h={portfolioChange24h} isLoading={isLoading} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PriceChart />
        </div>
        <div className="space-y-6">
          <TradePanel cryptoList={cryptoList} />
        </div>
      </div>
      <RecentTrades />
    </div>
  );
}