import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import TopBar from "@/components/crypto/TopBar";
import PortfolioStats from "@/components/crypto/PortfolioStats";
import PriceChart from "@/components/crypto/PriceChart";
import TradePanel from "@/components/crypto/TradePanel";
import MarketTable from "@/components/crypto/MarketTable";
import RecentTrades from "@/components/crypto/RecentTrades";
import CardSection from "@/components/crypto/CardSection";
import AlertManager from "@/components/crypto/AlertManager";
import NotificationCenter from "@/components/crypto/NotificationCenter";
import { CRYPTO_LIST } from "@/components/crypto/CryptoData";

export default function Dashboard() {
  const { data: alerts = [], refetch: refetchAlerts } = useQuery({
    queryKey: ["alerts"],
    queryFn: () => base44.entities.Alert.list(),
    initialData: [],
  });

  const cryptoPrices = CRYPTO_LIST.reduce((acc, coin) => {
    acc[coin.symbol] = coin.price;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <div className="p-4 md:p-6 space-y-6 max-w-screen-2xl mx-auto">
        <CardSection />

        <PortfolioStats />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PriceChart />
          </div>
          <div>
            <TradePanel />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MarketTable />
          </div>
          <div>
            <RecentTrades />
          </div>
        </div>

        <AlertManager alerts={alerts} onAlertsUpdate={refetchAlerts} />

        <NotificationCenter alerts={alerts} cryptoPrices={cryptoPrices} />
      </div>
    </div>
  );
}