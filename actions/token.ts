"use server";

import { v4 } from "uuid";
import { AccessToken } from "livekit-server-sdk";

import { getSelf } from "@/lib/auth-service";
import { getUserById } from "@/lib/user-service";
import { isBlockedByUser } from "@/lib/block-service";
import { db } from "@/lib/db";

export const createViewerToken = async (hostIdentity: string) => {
  let self;
  let isGuest = false;

  try {
    self = await getSelf();
  } catch {
    const id = v4();
    const username = `guest#${Math.floor(Math.random() * 1000)}`;
    self = { id, username };
    isGuest = true;
  }

  const host = await getUserById(hostIdentity);

  if (!host) {
    throw new Error("User not found");
  }

  const isBlocked = await isBlockedByUser(host.id);

  if (isBlocked) {
    throw new Error("User is blocked");
  }

  const isHost = self.id === host.id;

  // Chat permissions are enforced here, server-side: hiding the input in the UI is not enough
  // because any viewer could otherwise publish data messages straight through the LiveKit SDK.
  let canChat = false;
  if (isHost) {
    canChat = true;
  } else if (!isGuest) {
    const stream = await db.stream.findUnique({
      where: { userId: host.id },
      select: { isChatEnabled: true, isChatFollowersOnly: true },
    });
    if (stream?.isChatEnabled) {
      if (!stream.isChatFollowersOnly) {
        canChat = true;
      } else {
        const follow = await db.follow.findUnique({
          where: {
            followerId_followingId: { followerId: self.id, followingId: host.id },
          },
          select: { id: true },
        });
        canChat = !!follow;
      }
    }
  }

  const token = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
    {
      identity: isHost ? `host-${self.id}` : self.id,
      name: self.username,
    }
  );

  token.addGrant({
    room: host.id,
    roomJoin: true,
    canPublish: false,
    canPublishData: canChat,
  });

  return await Promise.resolve(token.toJwt());
};
