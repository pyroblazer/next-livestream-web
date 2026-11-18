import { getSelf } from "@/lib/auth-service";
import { db } from "@/lib/db";

const AnalyticsPage = async () => {
  const self = await getSelf();
  const [stream, followers, blocked, openReports] = await Promise.all([
    db.stream.findUnique({ where: { userId: self.id } }),
    db.follow.count({ where: { followingId: self.id } }),
    db.block.count({ where: { blockerId: self.id } }),
    db.report.count({ where: { reportedId: self.id, resolved: false } }),
  ]);

  const stats: [string, string | number][] = [
    ["Followers", followers],
    ["Watching now", stream?.isLive ? stream.viewerCount : 0],
    ["Peak viewers", stream?.peakViewers ?? 0],
    ["Blocked users", blocked],
    ["Open reports against you", openReports],
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Analytics</h1>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-xl bg-muted p-4">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsPage;
