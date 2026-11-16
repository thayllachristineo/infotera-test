import type {
  Amenity,
  CancellationPolicy,
  PropertyType,
  RoomAmenity,
  Suggestion,
} from "@/types/api";
import type { SortKey } from "@/types/search";

export const PRICE_MIN = 0;
export const PRICE_MAX = 3500;
export const PRICE_STEP = 50;
export const PAGE_SIZE = 9;
export const REVIEW_PAGE_SIZE = 4;
export const MAX_RECENT_SEARCHES = 5;
export const MAX_BOOKING_HISTORY = 5;

export const AMENITIES: Amenity[] = [
  "wifi",
  "breakfast",
  "pool",
  "spa",
  "restaurant",
  "gym",
  "parking",
  "bar",
  "room_service",
  "beach_access",
  "kids_club",
  "business_center",
  "concierge",
  "valet",
  "lounge_access",
];

export const AMENITY_LABEL: Record<Amenity, string> = {
  wifi: "Wi-Fi",
  breakfast: "Café da manhã",
  pool: "Piscina",
  spa: "Spa",
  restaurant: "Restaurante",
  gym: "Academia",
  parking: "Estacionamento",
  bar: "Bar",
  room_service: "Serviço de quarto",
  beach_access: "Acesso à praia",
  kids_club: "Espaço kids",
  business_center: "Centro de negócios",
  concierge: "Concierge",
  valet: "Manobrista",
  lounge_access: "Acesso ao lounge",
};

export const ROOM_AMENITY_LABEL: Record<RoomAmenity, string> = {
  ocean_view: "Vista para o mar",
  city_view: "Vista da cidade",
  garden_view: "Vista do jardim",
  balcony: "Varanda",
  terrace: "Terraço",
  bathtub: "Banheira",
  minibar: "Frigobar",
  safe: "Cofre",
  aircon: "Ar-condicionado",
  desk: "Escrivaninha",
  kitchen: "Cozinha",
  living_room: "Sala de estar",
  sound_system: "Som",
  butler: "Mordomo",
  pool_access: "Acesso à piscina",
  garden: "Jardim",
  lounge_access: "Acesso ao lounge",
};

export const PROPERTY_LABEL: Record<PropertyType, string> = {
  hotel: "Hotel",
  pousada: "Pousada",
  resort: "Resort",
};

export const PROPERTY_TYPES: PropertyType[] = ["hotel", "pousada", "resort"];

export const SUGGESTION_LABEL: Record<Suggestion["type"], string> = {
  city: "Cidade",
  beach: "Praia",
  island: "Ilha",
  nature: "Natureza",
};

export const SORT_OPTIONS: Array<{
  id: SortKey;
  label: string;
  field: "reviewCount" | "pricePerNight" | "rating";
  order: "asc" | "desc";
}> = [
  { id: "popular", label: "Mais popular", field: "reviewCount", order: "desc" },
  {
    id: "price_asc",
    label: "Menor preço",
    field: "pricePerNight",
    order: "asc",
  },
  {
    id: "rating_desc",
    label: "Maior avaliação",
    field: "rating",
    order: "desc",
  },
];

export const RATING_OPTIONS = [
  { value: 0, label: "Qualquer" },
  { value: 3, label: "3+" },
  { value: 3.5, label: "3,5+" },
  { value: 4, label: "4+" },
  { value: 4.5, label: "4,5+" },
] as const;

export const CANCELLATION_COPY: Record<
  CancellationPolicy,
  { title: string; summary: string; details: string }
> = {
  free: {
    title: "Cancelamento grátis",
    summary: "Sem custo até 48 horas antes do check-in.",
    details:
      "Cancele até 48 horas antes do horário de check-in e o valor pago é devolvido integralmente. Depois desse prazo, a primeira noite fica retida. No-show é cobrado por completo. Mudança de data depende de disponibilidade e pode alterar o preço.",
  },
  moderate: {
    title: "Cancelamento moderado",
    summary: "Grátis até 5 dias antes. Depois, a primeira noite fica retida.",
    details:
      "Até 5 dias antes do check-in o cancelamento é integral. Entre 5 dias e 48 horas, cobramos a primeira noite. Com menos de 48 horas, ou em no-show, cobramos a estadia toda. O restante, se houver, volta pelo mesmo meio informado no checkout.",
  },
  strict: {
    title: "Tarifa não reembolsável",
    summary: "O valor não é devolvido depois da confirmação.",
    details:
      "Esta tarifa não prevê reembolso. A troca de nome do hóspede principal pode ser pedida até 24 horas antes do check-in, sujeita à confirmação do hotel. Datas não podem ser alteradas com esta tarifa.",
  },
};

export const TERMS_TEXT = `Estes termos valem para o ambiente de demonstração da Orla.

1. A reserva é um exercício de interface. Nenhum quarto é bloqueado de verdade e nenhum pagamento é capturado.
2. O número do cartão é validado apenas no seu navegador, pelo algoritmo de Luhn, e não é enviado à API.
3. Os preços exibidos somam diárias, taxa de serviço de 10% e impostos de 5%. Cupons ORLA10 e PRAIA50 são locais.
4. A política de cancelamento mostrada no hotel é informativa. Esta API não processa cancelamentos.
5. Dados de hóspedes ficam na mock-api até o próximo reinício do servidor, quando o banco volta ao seed.
6. Ao confirmar, você declara que leu o resumo da estadia e que os dados do hóspede principal estão corretos.`;

export function isAmenity(value: string): value is Amenity {
  return (AMENITIES as string[]).includes(value);
}

export function isPropertyType(value: string): value is PropertyType {
  return (PROPERTY_TYPES as string[]).includes(value);
}
