import type { Metadata } from "next";
import { FeaturedHotels, HomeSteps } from "@/components/home/featured-hotels";
import { HomeHero } from "@/components/home/home-hero";

export const metadata: Metadata = {
  title: "Orla",
  description:
    "Busque hotéis no Brasil e reserve com o preço da estadia fechado.",
};

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <HomeSteps />
      <FeaturedHotels />
    </>
  );
}
