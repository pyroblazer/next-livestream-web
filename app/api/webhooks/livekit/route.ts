import { headers } from "next/headers";
import { WebhookReceiver } from "livekit-server-sdk";

import { db } from "@/lib/db";

const receiver = new WebhookReceiver(
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
);

export async function POST(req: Request) {
  const body = await req.text();
  const headerPayload = await headers();
  const authorization = headerPayload.get("Authorization");

  if (!authorization) {
    return new Response("No authorization header", { status: 400 });
  }

  let event;
  try {
    event = receiver.receive(body, authorization);
  } catch {
    return new Response("Invalid signature", { status: 401 });
  }

  if (event.event === "ingress_started") {
    await db.stream.updateMany({
      where: {
        ingressId: event.ingressInfo?.ingressId,
      },
      data: {
        isLive: true,
      },
    });
  }

  if (event.event === "ingress_ended") {
    await db.stream.updateMany({
      where: {
        ingressId: event.ingressInfo?.ingressId,
      },
      data: {
        isLive: false,
      },
    });
  }

  // Viewer counts (room name is the streamer id; the streamer's own identity starts with "host-")
  const roomName = event.room?.name;
  const identity = event.participant?.identity ?? "";
  if (roomName && !identity.startsWith("host-")) {
    if (event.event === "participant_joined") {
      const updated = await db.stream.update({
        where: { userId: roomName },
        data: { viewerCount: { increment: 1 } },
      }).catch(() => null);
      if (updated && updated.viewerCount > updated.peakViewers) {
        await db.stream.update({ where: { userId: roomName }, data: { peakViewers: updated.viewerCount } });
      }
    }
    if (event.event === "participant_left") {
      await db.stream.updateMany({
        where: { userId: roomName, viewerCount: { gt: 0 } },
        data: { viewerCount: { decrement: 1 } },
      });
    }
  }
  if (event.event === "room_finished" && roomName) {
    await db.stream.updateMany({ where: { userId: roomName }, data: { viewerCount: 0 } });
  }

  return new Response("ok", { status: 200 });
}
