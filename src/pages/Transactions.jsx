import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, XCircle, Loader2, Send, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Transactions() {
  const [withdrawalDialog, setWithdrawalDialog] = useState(false);
  const [withdrawalMethod, setWithdrawalMethod] = useState("");
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  
  const queryClient = useQueryClient();
  
  const { data: transactions = [], isLoading, refetch } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => base44.entities.Transaction.list("-transaction_date", 50),
    initialData: [],
  });

  const withdrawalMutation = useMutation({
    mutationFn: async (data) => {
      const transaction = await base44.entities.Transaction.create({
        type: "withdrawal",
        amount: parseFloat(data.amount),
        total_value: parseFloat(data.amount),
        status: "pending",
        transaction_date: new Date().toISOString(),
        notes: `Withdrawal via ${data.method}`,
      });
      return transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setWithdrawalDialog(false);
      setWithdrawalAmount("");
      setWithdrawalMethod("");
      toast.success("Withdrawal request submitted successfully");
    },
    onError: () => {
      toast.error("Failed to submit withdrawal request");
    },
  });

  const handleWithdrawal = () => {
    if (!withdrawalMethod || !withdrawalAmount) {
      toast.error("Please select a method and enter an amount");
      return;
    }
    withdrawalMutation.mutate({
      method: withdrawalMethod,
      amount: withdrawalAmount,
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-primary" />;
      case "pending":
        return <Clock className="w-5 h-5 text-accent" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-primary/10 text-primary";
      case "pending":
        return "bg-accent/10 text-accent";
      case "failed":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getTypeIcon = (type, side) => {
    if (type === "withdrawal") {
      return <ArrowUpRight className="w-5 h-5 text-primary" />;
    }
    return side === "buy" ? (
      <ArrowDownLeft className="w-5 h-5 text-accent" />
    ) : (
      <ArrowUpRight className="w-5 h-5 text-primary" />
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Transactions</h1>
            <p className="text-muted-foreground">View your recent trading activity and withdrawal requests</p>
          </div>
          <Button
            onClick={() => setWithdrawalDialog(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Send className="w-4 h-4 mr-2" />
            Withdraw Funds
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx, index) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-lg border border-border/50 p-4 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-lg bg-secondary/50">
                      {getTypeIcon(tx.type, tx.side)}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground capitalize">
                        {tx.type === "withdrawal" ? "Withdrawal" : `${tx.side} ${tx.crypto_symbol}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(tx.transaction_date), "MMM d, yyyy • h:mm a")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {tx.side === "sell" || tx.type === "withdrawal" ? "-" : "+"}{tx.amount} {tx.crypto_symbol || "USD"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ${tx.total_value?.toLocaleString() || (tx.amount * tx.price).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${getStatusColor(tx.status)}`}>
                        {getStatusIcon(tx.status)}
                        <span className="text-xs font-medium capitalize">{tx.status}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {tx.notes && (
                  <div className="mt-3 pl-14 text-xs text-muted-foreground italic">
                    {tx.notes}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        <Dialog open={withdrawalDialog} onOpenChange={setWithdrawalDialog}>
          <DialogContent className="border-border/50 bg-card">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary" />
                Withdraw Funds
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Withdrawal Method</label>
                <Select value={withdrawalMethod} onValueChange={setWithdrawalMethod}>
                  <SelectTrigger className="bg-secondary/50 border-border">
                    <SelectValue placeholder="Select withdrawal method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="crypto_wallet">Crypto Wallet</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="wire_transfer">Wire Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Amount (USD)</label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  className="bg-secondary/50 border-border"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="bg-secondary/30 rounded-lg p-3 border border-border/50">
                <p className="text-xs text-muted-foreground mb-1">Processing Fee</p>
                <p className="text-sm font-semibold text-foreground">
                  ${withdrawalAmount ? (parseFloat(withdrawalAmount) * 0.02).toFixed(2) : "0.00"} (2%)
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setWithdrawalDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleWithdrawal}
                  disabled={withdrawalMutation.isPending}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  {withdrawalMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Submit Request
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}