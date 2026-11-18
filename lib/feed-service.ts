import { db } from "@/lib/db"
import { getSelf } from "@/lib/auth-service"

export const getStreams = async (category?: string) => {
  const categoryFilter = category ? { category } : {};
  let userId;

  try {
    const self = await getSelf();
    userId = self.id;
  } catch {
    userId = null;
  }

  let streams = [];

  if (userId) {
    streams = await db.stream.findMany({
      where: {
        ...categoryFilter,
        user: {
          NOT: {
            blocking: {
              some: {
                blockedId: userId,
              }
            }
          }
        }
      },
      select: {
        id: true,
        user: true,
        isLive: true,
        name: true,
        thumbnailUrl: true,
      },
      take: 100,
      orderBy: [
        {
          isLive: "desc",
        },
        {
          updatedAt: "desc",
        }
      ],
    });
  } else {
    streams = await db.stream.findMany({
      where: categoryFilter,
      select: {
        id: true,
        user: true,
        isLive: true,
        name: true,
        thumbnailUrl: true,
      },
      take: 100,
      orderBy: [
        {
          isLive: "desc",
        },
        {
          updatedAt: "desc",
        }
      ]
    });
  }

  return streams;
};
