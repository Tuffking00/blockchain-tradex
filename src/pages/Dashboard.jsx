import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import TopBar from "@/components/crypto/TopBar";
import WithdrawalSidebar from "@/components/crypto/WithdrawalSidebar";
import PortfolioStats from "@/components/crypto/PortfolioStats";
import PriceChart from "@/components/crypto/PriceChart";
import TradePanel from "@/components/crypto/TradePanel";
import MarketTable from "@/components/crypto/MarketTable";
import RecentTrades from "@/components/crypto/RecentTrades";
import CardSection from "@/components/crypto/CardSection";
import AlertManager from "@/components/crypto/AlertManager";
import NotificationCenter from "@/components/crypto/NotificationCenter";
import { useLivePrices } from "@/hooks/useLivePrices";

export default function Dashboard() {
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const { cryptoList, isLoading, lastUpdated, portfolioTotal, portfolioChange24h, refetch } = useLivePrices();

  const { data: alerts = [], refetch: refetchAlerts } = useQuery({
    queryKey: ["alerts"],
    queryFn: () => base44.entities.Alert.list(),
    initialData: [],
  });

  const cryptoPrices = cryptoList.reduce((acc, coin) => {
    acc[coin.symbol] = coin.price;
    return acc;
  }, {});

  const cryptoChanges = cryptoList.reduce((acc, coin) => {
    acc[coin.symbol] = coin.change24h;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background">
      <TopBar
        portfolioTotal={portfolioTotal}
        isLoading={isLoading}
        lastUpdated={lastUpdated}
        onRefresh={refetch}
        onWithdraw={() => setWithdrawOpen(true)}
      />
      <WithdrawalSidebar open={withdrawOpen} onClose={() => setWithdrawOpen(false)} />

      <div className="p-4 md:p-6 max-w-screen-2xl mx-auto space-y-6">

        {/* Row 1: Stats */}
        <PortfolioStats
          portfolioTotal={portfolioTotal}
          portfolioChange24h={portfolioChange24h}
          isLoading={isLoading}
        />

        {/* Row 2: Chart + Card + Trade */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PriceChart />
          </div>
          <div className="flex flex-col gap-6">
            <CardSection />
            <TradePanel cryptoList={cryptoList} />
          </div>
        </div>

        {/* Row 3: Market Table + Recent Trades + Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MarketTable cryptoList={cryptoList} isLoading={isLoading} />
          </div>
          <div className="flex flex-col gap-6">
            <RecentTrades />
            <AlertManager alerts={alerts} onAlertsUpdate={refetchAlerts} cryptoPrices={cryptoPrices} cryptoChanges={cryptoChanges} />
          </div>
        </div>

        <NotificationCenter alerts={alerts} cryptoPrices={cryptoPrices} cryptoChanges={cryptoChanges} />
      </div>
    </div>
  );
}