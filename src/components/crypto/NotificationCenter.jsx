import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { AlertCircle, TrendingUp, TrendingDown, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationCenter({ alerts, cryptoPrices }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const checkAlerts = () => {
      const newNotifications = [];

      alerts.forEach((alert) => {
        if (!alert.is_active) return;

        const currentPrice = cryptoPrices[alert.crypto_symbol];
        if (!currentPrice) return;

        let shouldNotify = false;

        switch (alert.alert_type) {
          case "price_above":
            if (currentPrice >= alert.threshold_value && !alert.is_triggered) {
              shouldNotify = true;
            }
            break;
          case "price_below":
            if (currentPrice <= alert.threshold_value && !alert.is_triggered) {
              shouldNotify = true;
            }
            break;
          case "volatility":
            // Simple volatility check (in real scenario, calculate from price changes)
            if (Math.random() * 100 > 80 && !alert.is_triggered) {
              shouldNotify = true;
            }
            break;
        }

        if (shouldNotify) {
          newNotifications.push({
            id: alert.id,
            symbol: alert.crypto_symbol,
            type: alert.alert_type,
            threshold: alert.threshold_value,
            currentPrice,
            timestamp: new Date(),
          });

          // Mark alert as triggered
          base44.entities.Alert.update(alert.id, {
            is_triggered: true,
            triggered_at: new Date().toISOString(),
            current_price: currentPrice,
          });
        }
      });

      if (newNotifications.length > 0) {
        setNotifications((prev) => [
          ...newNotifications.map((n, idx) => ({ ...n, tempId: `${Date.now()}-${idx}` })),
          ...prev,
        ].slice(0, 5));
      }
    };

    const interval = setInterval(checkAlerts, 5000);
    return () => clearInterval(interval);
  }, [alerts, cryptoPrices]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setNotifications((prev) => prev.slice(0, 4));
    }, 8000);

    return () => clearTimeout(timer);
  }, [notifications]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "price_above":
        return <TrendingUp className="w-4 h-4 text-primary" />;
      case "price_below":
        return <TrendingDown className="w-4 h-4 text-destructive" />;
      case "volatility":
        return <Zap className="w-4 h-4 text-accent" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getNotificationMessage = (notif) => {
    switch (notif.type) {
      case "price_above":
        return `${notif.symbol} reached $${notif.currentPrice.toLocaleString()}`;
      case "price_below":
        return `${notif.symbol} dropped to $${notif.currentPrice.toLocaleString()}`;
      case "volatility":
        return `${notif.symbol} experiencing high volatility`;
      default:
        return "Alert triggered";
    }
  };

  return (
    <div className="fixed bottom-6 right-6 space-y-3 z-50 max-w-sm pointer-events-none">
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.tempId}
            initial={{ opacity: 0, y: 20, x: 400 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 400 }}
            transition={{ duration: 0.3 }}
            className="bg-card border border-primary/30 rounded-lg p-4 shadow-lg pointer-events-auto"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{getNotificationIcon(notif.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{getNotificationMessage(notif)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {notif.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}