"use client";

import { toast } from "sonner";
import { Flag } from "lucide-react";
import { useState, useTransition } from "react";
import { useAuth } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { reportUser } from "@/actions/moderation";
import { REPORT_REASONS } from "@/lib/moderation";

export const ReportButton = ({ hostIdentity }: { hostIdentity: string }) => {
  const { userId } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>(REPORT_REASONS[0]);
  const [isPending, startTransition] = useTransition();

  if (!userId) return null;

  const submit = () => {
    startTransition(() => {
      reportUser(hostIdentity, reason)
        .then((r) => {
          toast.success(r.duplicate ? "You already reported this channel" : "Report sent. Thank you.");
          setOpen(false);
        })
        .catch(() => toast.error("Something went wrong"));
    });
  };

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <Flag className="h-4 w-4 mr-2" />
        Report
      </Button>
      {open && (
        <div role="dialog" aria-label="Report channel" className="absolute right-0 z-20 mt-2 w-56 rounded-md border bg-background p-3 space-y-2">
          <select
            aria-label="Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-md border bg-background px-2 py-1 text-sm capitalize"
          >
            {REPORT_REASONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <Button size="sm" variant="primary" disabled={isPending} onClick={submit} className="w-full">
            Submit report
          </Button>
        </div>
      )}
    </div>
  );
};
