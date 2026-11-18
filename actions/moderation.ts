"use server";

import { revalidatePath } from "next/cache";
import { RoomServiceClient } from "livekit-server-sdk";

import { db } from "@/lib/db";
import { getSelf } from "@/lib/auth-service";
import { clampTimeoutMinutes, parseReportReason } from "@/lib/moderation";

/** The streamer or one of their moderators. */
const assertCanModerate = async (streamerId: string) => {
  const self = await getSelf();
  if (self.id === streamerId) return self;

  const mod = await db.moderator.findUnique({
    where: { streamerId_userId: { streamerId, userId: self.id } },
  });
  if (!mod) throw new Error("Unauthorized");
  return self;
};

const roomClient = () => {
  const url = process.env.LIVEKIT_API_URL || process.env.NEXT_PUBLIC_LIVEKIT_WS_URL;
  if (!url || !process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) return null;
  return new RoomServiceClient(
    url.replace(/^wss:/, "https:").replace(/^ws:/, "http:"),
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET
  );
};

/** Time a viewer out of chat. Also revokes their data-publish permission in the live room. */
export const timeoutUser = async (streamerId: string, targetUserId: string, minutes: number) => {
  const self = await assertCanModerate(streamerId);
  if (targetUserId === streamerId || targetUserId === self.id) throw new Error("Invalid target");

  const mod = await db.moderator.findUnique({
    where: { streamerId_userId: { streamerId, userId: targetUserId } },
  });
  if (mod) throw new Error("Cannot time out a moderator");

  const expiresAt = new Date(Date.now() + clampTimeoutMinutes(minutes) * 60_000);
  await db.chatTimeout.upsert({
    where: { streamerId_userId: { streamerId, userId: targetUserId } },
    update: { expiresAt },
    create: { streamerId, userId: targetUserId, expiresAt },
  });

  try {
    await roomClient()?.updateParticipant(streamerId, targetUserId, undefined, {
      canSubscribe: true,
      canPublish: false,
      canPublishData: false,
    });
  } catch {
    // viewer not connected right now: the token check blocks them on reconnect
  }

  return { expiresAt };
};

export const clearChatTimeout = async (streamerId: string, targetUserId: string) => {
  await assertCanModerate(streamerId);
  await db.chatTimeout.deleteMany({ where: { streamerId, userId: targetUserId } });
};

export const addModerator = async (username: string) => {
  const self = await getSelf();
  const target = await db.user.findUnique({ where: { username: String(username).trim() } });
  if (!target) throw new Error("User not found");
  if (target.id === self.id) throw new Error("You are already the streamer");

  await db.moderator.upsert({
    where: { streamerId_userId: { streamerId: self.id, userId: target.id } },
    update: {},
    create: { streamerId: self.id, userId: target.id },
  });
  revalidatePath(`/u/${self.username}/community`);
};

export const removeModerator = async (userId: string) => {
  const self = await getSelf();
  await db.moderator.deleteMany({ where: { streamerId: self.id, userId } });
  revalidatePath(`/u/${self.username}/community`);
};

export const reportUser = async (reportedId: string, reason: string, details?: string) => {
  const self = await getSelf();
  const parsed = parseReportReason(reason);
  if (!parsed) throw new Error("Invalid reason");
  if (reportedId === self.id) throw new Error("You cannot report yourself");

  const exists = await db.user.findUnique({ where: { id: reportedId }, select: { id: true } });
  if (!exists) throw new Error("User not found");

  // De-duplicate: one open report per reporter/target pair
  const open = await db.report.findFirst({ where: { reporterId: self.id, reportedId, resolved: false } });
  if (open) return { duplicate: true };

  await db.report.create({
    data: { reporterId: self.id, reportedId, reason: parsed, details: (details ?? "").slice(0, 500) },
  });
  return { duplicate: false };
};

export const isModeratorOf = async (streamerId: string) => {
  try {
    const self = await getSelf();
    if (self.id === streamerId) return true;
    const mod = await db.moderator.findUnique({
      where: { streamerId_userId: { streamerId, userId: self.id } },
      select: { id: true },
    });
    return !!mod;
  } catch {
    return false;
  }
};
