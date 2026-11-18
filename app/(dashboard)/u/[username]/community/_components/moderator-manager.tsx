"use client";

import { toast } from "sonner";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addModerator, removeModerator } from "@/actions/moderation";

interface ModeratorManagerProps {
  moderators: { id: string; username: string }[];
}

export const ModeratorManager = ({ moderators }: ModeratorManagerProps) => {
  const [isPending, startTransition] = useTransition();
  const [username, setUsername] = useState("");

  const add = () => {
    startTransition(() => {
      addModerator(username)
        .then(() => {
          toast.success(`${username} is now a moderator`);
          setUsername("");
        })
        .catch((e: Error) => toast.error(e.message || "Something went wrong"));
    });
  };

  const remove = (id: string) => {
    startTransition(() => {
      removeModerator(id)
        .then(() => toast.success("Moderator removed"))
        .catch(() => toast.error("Something went wrong"));
    });
  };

  return (
    <section aria-labelledby="mods-heading" className="rounded-xl bg-muted p-6 space-y-4">
      <h2 id="mods-heading" className="text-lg font-semibold">Moderators</h2>
      <div className="flex gap-2">
        <Input
          aria-label="Moderator username"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Button onClick={add} disabled={isPending || !username.trim()} variant="primary">Add</Button>
      </div>
      {moderators.length === 0 ? (
        <p className="text-sm text-muted-foreground">No moderators yet.</p>
      ) : (
        <ul className="space-y-2">
          {moderators.map((m) => (
            <li key={m.id} className="flex items-center justify-between text-sm">
              <span>{m.username}</span>
              <Button variant="ghost" size="sm" disabled={isPending} onClick={() => remove(m.id)}>
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
