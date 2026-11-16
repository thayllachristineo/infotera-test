import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
  return (
    <Container className="py-16">
      <Skeleton className="h-12 w-2/3" />
      <Skeleton className="mt-6 h-64 w-full" />
    </Container>
  );
}
