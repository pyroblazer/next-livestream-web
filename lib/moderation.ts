/** Pure chat-moderation rules, shared by server actions and the chat UI. */

export const STREAM_CATEGORIES = [
  "Gaming",
  "Just Chatting",
  "Music",
  "Art",
  "Sports",
  "Education",
  "Tech",
  "IRL",
] as const;

export const normalizeCategory = (value: unknown): string | null => {
  const found = STREAM_CATEGORIES.find((c) => c.toLowerCase() === String(value ?? "").toLowerCase());
  return found ?? null;
};

export const MAX_BANNED_WORDS = 50;

/** "Foo, bar\nBaz" -> ["foo", "bar", "baz"] (lowercased, de-duplicated, capped). */
export const parseBannedWords = (raw: string | null | undefined): string[] => {
  if (!raw) return [];
  const words = raw
    .split(/[\n,]/)
    .map((w) => w.trim().toLowerCase())
    .filter((w) => w.length >= 2 && w.length <= 40);
  return Array.from(new Set(words)).slice(0, MAX_BANNED_WORDS);
};

export const containsBannedWord = (message: string, words: string[]): boolean => {
  const text = message.toLowerCase();
  return words.some((w) => text.includes(w));
};

export const MAX_SLOW_MODE_SECONDS = 120;

export const clampSlowMode = (value: unknown): number => {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(n, MAX_SLOW_MODE_SECONDS);
};

/** Seconds the viewer still has to wait before sending again (0 = may send now). */
export const slowModeWait = (lastSentAt: number | null, now: number, seconds: number): number => {
  if (!seconds || lastSentAt === null) return 0;
  const remaining = Math.ceil((lastSentAt + seconds * 1000 - now) / 1000);
  return Math.max(remaining, 0);
};

export const TIMEOUT_MINUTES = [1, 5, 10, 60, 1440] as const;

export const clampTimeoutMinutes = (value: unknown): number => {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, 60 * 24 * 7);
};

export const isTimeoutActive = (expiresAt: Date | string | null | undefined, now = Date.now()): boolean =>
  !!expiresAt && new Date(expiresAt).getTime() > now;

export const REPORT_REASONS = ["spam", "harassment", "hate", "nsfw", "other"] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export const parseReportReason = (value: unknown): ReportReason | null =>
  REPORT_REASONS.find((r) => r === value) ?? null;
