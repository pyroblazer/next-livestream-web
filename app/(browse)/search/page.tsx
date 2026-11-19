import { Suspense } from "react";
import { redirect } from "next/navigation";

import { Results, ResultsSkeleton } from "./_components/results";

interface SearchPageProps {
  searchParams: Promise<{
    term?: string;
  }>;
};

const SearchPage = async (props: SearchPageProps) => {
  const searchParams = await props.searchParams;
  if (!searchParams.term) {
    redirect("/");
  }

  return ( 
    <div className="h-full p-8 max-w-screen-2xl mx-auto">
      <Suspense fallback={<ResultsSkeleton />}>
        <Results term={searchParams.term} />
      </Suspense>
    </div>
  );
};
 
export default SearchPage;
