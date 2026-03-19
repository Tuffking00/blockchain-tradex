import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CRYPTO_LIST } from "./CryptoData";
import { Bell, Plus, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";

export default function AlertManager({ alerts, onAlertsUpdate }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    crypto_symbol: "BTC",
    alert_type: "price_above",
    threshold_value: "",
  });
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!formData.threshold_value) return;

    setLoading(true);
    try {
      await base44.entities.Alert.create({
        ...formData,
        threshold_value: parseFloat(formData.threshold_value),
        is_active: true,
      });
      setFormData({ crypto_symbol: "BTC", alert_type: "price_above", threshold_value: "" });
      setShowForm(false);
      onAlertsUpdate();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (alertId) => {
    await base44.entities.Alert.delete(alertId);
    onAlertsUpdate();
  };

  const handleToggle = async (alert) => {
    await base44.entities.Alert.update(alert.id, {
      is_active: !alert.is_active,
    });
    onAlertsUpdate();
  };

  const getAlertLabel = (type, threshold) => {
    switch (type) {
      case "price_above":
        return `Price above $${threshold.toLocaleString()}`;
      case "price_below":
        return `Price below $${threshold.toLocaleString()}`;
      case "volatility":
        return `Volatility above ${threshold}%`;
      default:
        return threshold;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-card rounded-xl border border-border/50 p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Price Alerts</h3>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          size="sm"
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-1" />
          New Alert
        </Button>
      </div>

      {showForm && (
        <div className="bg-secondary/30 rounded-lg p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Select value={formData.crypto_symbol} onValueChange={(v) => setFormData({ ...formData, crypto_symbol: v })}>
              <SelectTrigger className="bg-secondary/50 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CRYPTO_LIST.map((c) => (
                  <SelectItem key={c.symbol} value={c.symbol}>
                    {c.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={formData.alert_type} onValueChange={(v) => setFormData({ ...formData, alert_type: v })}>
              <SelectTrigger className="bg-secondary/50 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price_above">Price Above</SelectItem>
                <SelectItem value="price_below">Price Below</SelectItem>
                <SelectItem value="volatility">High Volatility</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Input
            type="number"
            placeholder="Enter threshold value"
            value={formData.threshold_value}
            onChange={(e) => setFormData({ ...formData, threshold_value: e.target.value })}
            className="bg-secondary/50 border-border/50"
          />

          <div className="flex gap-2">
            <Button onClick={handleCreate} disabled={loading} className="flex-1 bg-primary hover:bg-primary/90">
              {loading ? "Creating..." : "Create Alert"}
            </Button>
            <Button onClick={() => setShowForm(false)} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {alerts.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No alerts yet. Create one to get started!</p>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                alert.is_active
                  ? "bg-primary/5 border-primary/30"
                  : "bg-muted/30 border-border/30 opacity-50"
              }`}
            >
              <div className="flex-1">
                <p className="text-sm font-medium">{alert.crypto_symbol}</p>
                <p className="text-xs text-muted-foreground">{getAlertLabel(alert.alert_type, alert.threshold_value)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggle(alert)}
                  className="text-xs px-2 py-1 rounded bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  {alert.is_active ? "On" : "Off"}
                </button>
                <button
                  onClick={() => handleDelete(alert.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}