import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import ConfirmationLoading from "@/app/confirmation/[bookingId]/loading";
import { ConfirmationView } from "@/components/confirmation/confirmation-view";
import { ApiError } from "@/lib/api/client";
import { getBooking } from "@/lib/api/endpoints";

type ConfirmationProps = {
  params: Promise<{ bookingId: string }>;
};

export const metadata: Metadata = {
  title: "Confirmação",
};

async function ConfirmationContent({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  await connection();
  const { bookingId } = await params;
  if (!/^[A-Za-z0-9_-]+$/.test(bookingId)) notFound();

  try {
    const booking = await getBooking(bookingId);
    return <ConfirmationView booking={booking} />;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}

export default function ConfirmationPage({ params }: ConfirmationProps) {
  return (
    <Suspense fallback={<ConfirmationLoading />}>
      <ConfirmationContent params={params} />
    </Suspense>
  );
}
