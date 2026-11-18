import { cache } from "react";
import { currentUser } from "@clerk/nextjs";

import { db } from "@/lib/db";

export const getSelf = cache(async () => {
  const self = await currentUser();

  if (!self || !self.username) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { externalUserId: self.id },
  });

  if (!user) {
    // upsert: the Clerk webhook and parallel server renders can race to create the same user
    return await db.user.upsert({
      where: { externalUserId: self.id },
      update: {},
      create: {
        externalUserId: self.id,
        username: self.username,
        imageUrl: self.imageUrl,
        stream: {
          create: {
            name: `${self.username}'s stream`,
          },
        },
      },
    });
  }

  return user;
});

export const getSelfByUsername = async (username: string) => {
  const self = await getSelf();

  const user = await db.user.findUnique({
    where: { username }
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (self.username !== user.username) {
    throw new Error("Unauthorized");
  }

  return user;
};
