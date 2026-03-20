import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function AdminWithdrawals() {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["withdrawal-requests"],
    queryFn: () => base44.entities.WithdrawalRequest.list("-created_at", 100),
    initialData: [],
  });

  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => base44.auth.me(),
  });

  const approveMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.WithdrawalRequest.update(selectedRequest.id, {
        status: "approved",
        reviewed_by: user.email,
        review_date: new Date().toISOString(),
        review_notes: reviewNotes,
      });

      await base44.entities.ComplianceLog.create({
        action: "withdrawal_approved",
        withdrawal_request_id: selectedRequest.id,
        user_email: selectedRequest.requested_by,
        admin_email: user.email,
        details: `Approved withdrawal of $${selectedRequest.amount} via ${selectedRequest.withdrawal_method}. Notes: ${reviewNotes}`,
        timestamp: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["withdrawal-requests"] });
      toast.success("Withdrawal approved");
      setSelectedRequest(null);
      setReviewNotes("");
    },
    onError: () => {
      toast.error("Failed to approve withdrawal");
    },
  });

  const declineMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.WithdrawalRequest.update(selectedRequest.id, {
        status: "declined",
        reviewed_by: user.email,
        review_date: new Date().toISOString(),
        review_notes: reviewNotes,
      });

      await base44.entities.ComplianceLog.create({
        action: "withdrawal_declined",
        withdrawal_request_id: selectedRequest.id,
        user_email: selectedRequest.requested_by,
        admin_email: user.email,
        details: `Declined withdrawal of $${selectedRequest.amount} via ${selectedRequest.withdrawal_method}. Notes: ${reviewNotes}`,
        timestamp: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["withdrawal-requests"] });
      toast.success("Withdrawal declined");
      setSelectedRequest(null);
      setReviewNotes("");
    },
    onError: () => {
      toast.error("Failed to decline withdrawal");
    },
  });

  const pending = requests.filter((r) => r.status === "pending");
  const approved = requests.filter((r) => r.status === "approved");
  const declined = requests.filter((r) => r.status === "declined");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Withdrawal Requests</h1>
        <p className="text-muted-foreground">Review and approve user withdrawal requests</p>
      </div>

      {selectedRequest ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border/50 p-6 space-y-4"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Review Request</h2>
            <button
              onClick={() => setSelectedRequest(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-secondary/30 rounded-lg p-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">User</p>
              <p className="font-semibold">{selectedRequest.requested_by}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Amount</p>
              <p className="font-semibold">${selectedRequest.amount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Method</p>
              <p className="font-semibold capitalize">{selectedRequest.withdrawal_method.replace(/_/g, " ")}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Destination</p>
              <p className="font-semibold text-sm break-all">{selectedRequest.destination}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Review Notes</label>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Add notes for this decision..."
              className="w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              rows="4"
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => approveMutation.mutate()}
              disabled={approveMutation.isPending}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {approveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Approve
            </Button>
            <Button
              onClick={() => declineMutation.mutate()}
              disabled={declineMutation.isPending}
              variant="destructive"
              className="flex-1"
            >
              {declineMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Decline
            </Button>
          </div>
        </motion.div>
      ) : null}

      <div className="space-y-4">
        {/* Pending */}
        {pending.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              Pending ({pending.length})
            </h3>
            {pending.map((req) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-card rounded-lg border border-border/50 p-4 flex items-center justify-between hover:border-primary/30 transition-colors"
              >
                <div>
                  <p className="font-semibold">{req.requested_by}</p>
                  <p className="text-sm text-muted-foreground">
                    ${req.amount.toLocaleString()} • {req.withdrawal_method.replace(/_/g, " ")}
                  </p>
                </div>
                <Button onClick={() => setSelectedRequest(req)} variant="outline" size="sm">
                  Review
                </Button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Approved */}
        {approved.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Approved ({approved.length})
            </h3>
            {approved.map((req) => (
              <div
                key={req.id}
                className="bg-card rounded-lg border border-border/50 p-4 opacity-75"
              >
                <p className="font-semibold">{req.requested_by}</p>
                <p className="text-sm text-muted-foreground">
                  ${req.amount.toLocaleString()} • Approved on{" "}
                  {new Date(req.review_date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Declined */}
        {declined.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              Declined ({declined.length})
            </h3>
            {declined.map((req) => (
              <div
                key={req.id}
                className="bg-card rounded-lg border border-border/50 p-4 opacity-75"
              >
                <p className="font-semibold">{req.requested_by}</p>
                <p className="text-sm text-muted-foreground">
                  ${req.amount.toLocaleString()} • Declined on{" "}
                  {new Date(req.review_date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}

        {requests.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No withdrawal requests yet</p>
          </div>
        )}
      </div>
    </div>
  );
}