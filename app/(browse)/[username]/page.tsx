import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getUserByUsername } from "@/lib/user-service";
import { isFollowingUser } from "@/lib/follow-service";
import { isBlockedByUser } from "@/lib/block-service";
import { StreamPlayer } from "@/components/stream-player";

interface UserPageProps {
  params: {
    username: string;
  };
};

export async function generateMetadata({ params }: UserPageProps): Promise<Metadata> {
  const user = await getUserByUsername(params.username);
  if (!user?.stream) return { title: "Channel not found" };
  const title = `${user.username} ${user.stream.isLive ? "is live" : "on Streamify"}`;
  const description = user.bio?.slice(0, 160) || user.stream.name;
  return {
    title,
    description,
    openGraph: { title, description, images: user.stream.thumbnailUrl ? [user.stream.thumbnailUrl] : [user.imageUrl] },
  };
}

const UserPage = async ({
  params
}: UserPageProps) => {
  const user = await getUserByUsername(params.username);

  if (!user || !user.stream) {
    notFound();
  }

  const isFollowing = await isFollowingUser(user.id);
  const isBlocked = await isBlockedByUser(user.id);

  if (isBlocked) {
    notFound();
  }

  return ( 
    <StreamPlayer
      user={user}
      stream={user.stream}
      isFollowing={isFollowing}
    />
  );
}
 
export default UserPage;