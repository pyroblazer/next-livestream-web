import { Suspense } from "react";
import Link from "next/link";

import { STREAM_CATEGORIES, normalizeCategory } from "@/lib/moderation";

import { Results, ResultsSkeleton } from "./_components/results";

export default async function Page(props: { searchParams?: Promise<{ category?: string }> }) {
  const searchParams = await props.searchParams;
  const category = normalizeCategory(searchParams?.category) ?? undefined;
  return (
    <div className="h-full p-8 max-w-screen-2xl mx-auto">
      <Suspense fallback={<ResultsSkeleton />}>
        <nav aria-label="Categories" className="flex flex-wrap gap-2 mb-6">
          <Link href="/" className={`px-3 py-1 rounded-full text-sm border ${!category ? "bg-primary text-primary-foreground" : ""}`}>All</Link>
          {STREAM_CATEGORIES.map((c) => (
            <Link key={c} href={`/?category=${encodeURIComponent(c)}`} className={`px-3 py-1 rounded-full text-sm border ${category === c ? "bg-primary text-primary-foreground" : ""}`}>{c}</Link>
          ))}
        </nav>
        <Results category={category} />
      </Suspense>
    </div>
  );
};
