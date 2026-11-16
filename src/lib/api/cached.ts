import { cacheLife, cacheTag } from "next/cache";
import { getHotel, getRooms } from "@/lib/api/endpoints";

/**
 * Catálogo do hotel com ISR. O perfil `minutes` revalida a cada minuto
 * e o shell da página continua estático entre as visitas.
 */
export async function getHotelCatalog(id: number) {
  "use cache";
  cacheLife("minutes");
  cacheTag("hotel", `hotel-${id}`);
  return getHotel(id);
}

export async function getRoomsCatalog(id: number) {
  "use cache";
  cacheLife("minutes");
  cacheTag("hotel", `hotel-${id}-rooms`);
  return getRooms(id);
}
