import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { HotelDetail } from "@/components/hotel/hotel-detail";
import { HotelSkeleton } from "@/components/hotel/hotel-skeleton";
import { getHotelCatalog, getRoomsCatalog } from "@/lib/api/cached";
import { ApiError } from "@/lib/api/client";

type HotelPageProps = {
  params: Promise<{ hotelId: string }>;
};

export async function generateStaticParams() {
  return [{ hotelId: "1" }, { hotelId: "2" }, { hotelId: "3" }];
}

export async function generateMetadata({
  params,
}: HotelPageProps): Promise<Metadata> {
  const { hotelId } = await params;
  const id = Number(hotelId);
  if (!Number.isInteger(id) || id <= 0) return { title: "Hotel" };
  try {
    const hotel = await getHotelCatalog(id);
    return { title: hotel.name, description: hotel.description };
  } catch {
    return { title: "Hotel" };
  }
}

async function HotelContent({
  params,
}: {
  params: Promise<{ hotelId: string }>;
}) {
  const { hotelId } = await params;
  const id = Number(hotelId);
  if (!Number.isInteger(id) || id <= 0) notFound();

  try {
    const [hotel, rooms] = await Promise.all([
      getHotelCatalog(id),
      getRoomsCatalog(id),
    ]);
    return <HotelDetail initialHotel={hotel} initialRooms={rooms} />;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}

export default function HotelPage({ params }: HotelPageProps) {
  return (
    <Suspense fallback={<HotelSkeleton />}>
      <HotelContent params={params} />
    </Suspense>
  );
}
