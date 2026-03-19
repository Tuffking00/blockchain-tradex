import React from "react";
import { Bell, Search, Settings, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PORTFOLIO_TOTAL } from "./CryptoData";

export default function TopBar() {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold text-sm">BT</span>
          </div>
          <h1 className="text-lg font-bold tracking-tight">
            Blockchain <span className="text-primary">Tradex</span>
          </h1>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-2 bg-secondary/50 rounded-xl px-4 py-2 w-80">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search markets..."
          className="bg-transparent text-sm outline-none w-full text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 bg-secondary/50 rounded-xl px-4 py-2">
          <Wallet className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">${PORTFOLIO_TOTAL.toLocaleString()}</span>
        </div>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Bell className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Settings className="w-5 h-5" />
        </Button>
        <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center">
          <span className="text-xs font-bold text-primary">U</span>
        </div>
      </div>
    </div>
  );
}