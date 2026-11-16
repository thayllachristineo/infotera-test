import { ROOM_AMENITY_LABEL } from "@/lib/constants";
import { formatBeds, formatBRL } from "@/lib/format";
import type { Room, RoomAmenity } from "@/types/api";

/**
 * Tabela dos quartos do hotel. A linha ganha fundo quando os valores diferem.
 */
export function RoomComparison({ rooms }: { rooms: Room[] }) {
  if (rooms.length < 2) return null;

  const amenities = [
    ...new Set(rooms.flatMap((room) => room.amenities)),
  ] as RoomAmenity[];

  const rows = [
    { label: "Tamanho", cells: rooms.map((room) => `${room.size} m²`) },
    { label: "Hóspedes", cells: rooms.map((room) => String(room.maxGuests)) },
    { label: "Camas", cells: rooms.map((room) => formatBeds(room.beds)) },
    {
      label: "Diária",
      cells: rooms.map((room) => formatBRL(room.pricePerNight)),
    },
    {
      label: "Disponíveis",
      cells: rooms.map((room) => String(room.available)),
    },
    ...amenities.map((amenity) => ({
      label: ROOM_AMENITY_LABEL[amenity],
      cells: rooms.map((room) =>
        room.amenities.includes(amenity) ? "Sim" : "—",
      ),
    })),
  ].map((row) => ({
    ...row,
    differs: new Set(row.cells).size > 1,
  }));

  return (
    <div className="mt-8">
      <h3 className="font-display text-2xl">Comparar quartos</h3>
      <p className="mt-1 text-sm text-muted">
        As linhas em destaque mudam de um quarto para outro.
      </p>
      <div className="mt-4 overflow-x-auto rounded-3xl border border-line">
        <table className="min-w-full border-collapse text-sm">
          <caption className="sr-only">
            Comparação de comodidades dos quartos
          </caption>
          <thead className="bg-sand text-left">
            <tr>
              <th scope="col" className="px-3 py-3 font-medium">
                Item
              </th>
              {rooms.map((room) => (
                <th key={room.id} scope="col" className="px-3 py-3 font-medium">
                  {room.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.label}
                className={row.differs ? "bg-clay/10" : "bg-paper"}
              >
                <th
                  scope="row"
                  className="px-3 py-2 text-left font-medium whitespace-nowrap"
                >
                  {row.label}
                </th>
                {row.cells.map((cell, index) => (
                  <td key={rooms[index]?.id ?? row.label} className="px-3 py-2">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
