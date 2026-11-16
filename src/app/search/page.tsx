import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchExperience } from "@/components/search/search-experience";
import { SearchPageSkeleton } from "@/components/search/skeletons";

export const metadata: Metadata = {
  title: "Busca",
};

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageSkeleton />}>
      <SearchExperience />
    </Suspense>
  );
}
