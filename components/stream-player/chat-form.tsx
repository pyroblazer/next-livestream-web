"use client";

import { useRef, useState } from "react";

import { containsBannedWord, parseBannedWords, slowModeWait } from "@/lib/moderation";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { ChatInfo } from "./chat-info";

interface ChatFormProps {
  onSubmit: () => void;
  value: string;
  onChange: (value: string) => void;
  isHidden: boolean;
  isFollowersOnly: boolean;
  isFollowing: boolean;
  isDelayed: boolean;
  slowModeSeconds?: number;
  bannedWords?: string | null;
};

export const ChatForm = ({
  onSubmit,
  value,
  onChange,
  isHidden,
  isFollowersOnly,
  isFollowing,
  isDelayed,
  slowModeSeconds = 0,
  bannedWords = null,
}: ChatFormProps) => {
  const [isDelayBlocked, setIsDelayBlocked] = useState(false);
  const [notice, setNotice] = useState("");
  const lastSent = useRef<number | null>(null);

  const isFollowersOnlyAndNotFollowing = isFollowersOnly && !isFollowing;
  const isDisabled = isHidden || isDelayBlocked || isFollowersOnlyAndNotFollowing;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!value || isDisabled) return;

    // Client-side guards (LiveKit data messages cannot be intercepted server-side).
    // Hard enforcement for abusers is the timeout, which revokes publish permission.
    if (containsBannedWord(value, parseBannedWords(bannedWords))) {
      setNotice("Your message contains a word that is not allowed in this chat.");
      return;
    }
    const wait = slowModeWait(lastSent.current, Date.now(), slowModeSeconds);
    if (wait > 0) {
      setNotice(`Slow mode: wait ${wait}s before sending another message.`);
      return;
    }
    setNotice("");
    lastSent.current = Date.now();

    if (isDelayed && !isDelayBlocked) {
      setIsDelayBlocked(true);
      setTimeout(() => {
        setIsDelayBlocked(false);
        onSubmit();
      }, 3000);
    } else {
      onSubmit();
    }
  }

  if (isHidden) {
    return null;
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      className="flex flex-col items-center gap-y-4 p-3"
    >
      <div className="w-full">
        <ChatInfo
          isDelayed={isDelayed}
          isFollowersOnly={isFollowersOnly}
        />
        {notice && <p role="alert" className="text-xs text-destructive mb-1">{notice}</p>}
        <Input
          onChange={(e) => onChange(e.target.value)}
          value={value}
          disabled={isDisabled}
          placeholder="Send a message"
          className={cn(
            "border-white/10",
            (isFollowersOnly || isDelayed) && "rounded-t-none border-t-0"
          )}
        />
      </div>
      <div className="ml-auto">
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={isDisabled}
        >
          Chat
        </Button>
      </div>
    </form>
  );
};

export const ChatFormSkeleton = () => {
  return (
    <div className="flex flex-col items-center gap-y-4 p-3">
      <Skeleton className="w-full h-10" />
      <div className="flex items-center gap-x-2 ml-auto">
        <Skeleton className="h-7 w-7" />
        <Skeleton className="h-7 w-12" />
      </div>
    </div>
  );
};
