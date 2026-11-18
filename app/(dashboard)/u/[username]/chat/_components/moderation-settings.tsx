"use client";

import { toast } from "sonner";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateStream } from "@/actions/stream";
import { STREAM_CATEGORIES } from "@/lib/moderation";

interface ModerationSettingsProps {
  category: string | null;
  slowModeSeconds: number;
  bannedWords: string | null;
}

export const ModerationSettings = ({ category, slowModeSeconds, bannedWords }: ModerationSettingsProps) => {
  const [isPending, startTransition] = useTransition();
  const [cat, setCat] = useState(category ?? "");
  const [slow, setSlow] = useState(String(slowModeSeconds));
  const [words, setWords] = useState(bannedWords ?? "");

  const save = () => {
    startTransition(() => {
      updateStream({
        category: cat || null,
        chatSlowModeSeconds: Number(slow) || 0,
        bannedWords: words,
      })
        .then(() => toast.success("Settings saved"))
        .catch(() => toast.error("Something went wrong"));
    });
  };

  return (
    <div className="rounded-xl bg-muted p-6 space-y-4">
      <div className="space-y-1">
        <label htmlFor="category" className="font-semibold text-sm">Category</label>
        <select
          id="category"
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="">Uncategorized</option>
          {STREAM_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label htmlFor="slow" className="font-semibold text-sm">Slow mode (seconds between messages, 0 = off)</label>
        <Input id="slow" type="number" min={0} max={120} value={slow} onChange={(e) => setSlow(e.target.value)} />
      </div>
      <div className="space-y-1">
        <label htmlFor="words" className="font-semibold text-sm">Banned words (comma or line separated)</label>
        <textarea
          id="words"
          value={words}
          onChange={(e) => setWords(e.target.value)}
          rows={3}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>
      <Button onClick={save} disabled={isPending} variant="primary">Save</Button>
    </div>
  );
};
