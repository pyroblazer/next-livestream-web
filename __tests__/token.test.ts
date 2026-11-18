import { beforeEach, describe, expect, it, vi } from "vitest";

const grants: Record<string, unknown>[] = [];

vi.mock("livekit-server-sdk", () => ({
  AccessToken: class {
    addGrant(grant: Record<string, unknown>) {
      grants.push(grant);
    }
    toJwt() {
      return "jwt";
    }
  },
}));

const getSelf = vi.fn();
vi.mock("@/lib/auth-service", () => ({ getSelf: () => getSelf() }));
vi.mock("@/lib/user-service", () => ({
  getUserById: vi.fn().mockResolvedValue({ id: "host-1", username: "host" }),
}));
vi.mock("@/lib/block-service", () => ({ isBlockedByUser: vi.fn().mockResolvedValue(false) }));

const streamFind = vi.fn();
const followFind = vi.fn();
const timeoutFind = vi.fn().mockResolvedValue(null);
vi.mock("@/lib/db", () => ({
  db: {
    stream: { findUnique: (...a: unknown[]) => streamFind(...a) },
    follow: { findUnique: (...a: unknown[]) => followFind(...a) },
    chatTimeout: { findUnique: (...a: unknown[]) => timeoutFind(...a) },
  },
}));

import { createViewerToken } from "@/actions/token";

const lastGrant = () => grants[grants.length - 1];

describe("createViewerToken chat permissions", () => {
  beforeEach(() => {
    grants.length = 0;
    getSelf.mockReset();
    streamFind.mockReset();
    followFind.mockReset();
    timeoutFind.mockReset();
    timeoutFind.mockResolvedValue(null);
  });

  it("revokes chat while a timeout is active, restores it after", async () => {
    getSelf.mockResolvedValue({ id: "viewer", username: "v" });
    streamFind.mockResolvedValue({ isChatEnabled: true, isChatFollowersOnly: false });
    timeoutFind.mockResolvedValue({ expiresAt: new Date(Date.now() + 60_000) });
    await createViewerToken("host-1");
    expect(lastGrant().canPublishData).toBe(false);

    timeoutFind.mockResolvedValue({ expiresAt: new Date(Date.now() - 1000) });
    await createViewerToken("host-1");
    expect(lastGrant().canPublishData).toBe(true);
  });

  it("never lets guests publish chat data", async () => {
    getSelf.mockRejectedValue(new Error("Unauthorized"));
    await createViewerToken("host-1");
    expect(lastGrant().canPublishData).toBe(false);
  });

  it("lets the host chat", async () => {
    getSelf.mockResolvedValue({ id: "host-1", username: "host" });
    await createViewerToken("host-1");
    expect(lastGrant().canPublishData).toBe(true);
  });

  it("blocks chat when the streamer disabled it", async () => {
    getSelf.mockResolvedValue({ id: "viewer", username: "v" });
    streamFind.mockResolvedValue({ isChatEnabled: false, isChatFollowersOnly: false });
    await createViewerToken("host-1");
    expect(lastGrant().canPublishData).toBe(false);
  });

  it("requires a follow in followers-only mode", async () => {
    getSelf.mockResolvedValue({ id: "viewer", username: "v" });
    streamFind.mockResolvedValue({ isChatEnabled: true, isChatFollowersOnly: true });
    followFind.mockResolvedValue(null);
    await createViewerToken("host-1");
    expect(lastGrant().canPublishData).toBe(false);

    followFind.mockResolvedValue({ id: "f1" });
    await createViewerToken("host-1");
    expect(lastGrant().canPublishData).toBe(true);
  });
});
