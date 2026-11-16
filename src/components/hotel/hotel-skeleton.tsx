import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";

export function HotelSkeleton() {
  return (
    <Container className="py-8">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="mt-4 h-12 w-2/3" />
      <Skeleton className="mt-6 aspect-[16/9] w-full" />
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    </Container>
  );
}
