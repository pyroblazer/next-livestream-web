import {format } from "date-fns";

import { getBlockedUsers } from "@/lib/block-service";

import { db } from "@/lib/db";
import { getSelf } from "@/lib/auth-service";
import { ModeratorManager } from "./_components/moderator-manager";
import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";

const CommunityPage = async () => {
  const blockedUsers = await getBlockedUsers();
  const self = await getSelf();
  const moderators = await db.moderator.findMany({
    where: { streamerId: self.id },
    include: { user: { select: { id: true, username: true } } },
  });

  const formattedData = blockedUsers.map((block) => ({
    ...block,
    userId: block.blocked.id,
    imageUrl: block.blocked.imageUrl,
    username: block.blocked.username,
    createdAt: format(new Date(block.blocked.createdAt), "dd/MM/yyyy"),
  }));

  return ( 
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">
          Community Settings
        </h1>
      </div>
      <ModeratorManager moderators={moderators.map((m) => ({ id: m.user.id, username: m.user.username }))} />
      <h2 className="text-lg font-semibold mt-8 mb-2">Blocked users</h2>
      <DataTable columns={columns} data={formattedData} />
    </div>
   );
}
 
export default CommunityPage;