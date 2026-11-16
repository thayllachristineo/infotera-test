import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function ConfirmationLoading() {
  return (
    <Container className="py-10">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-3 h-12 w-64" />
      <Skeleton className="mt-8 h-72 w-full" />
    </Container>
  );
}
