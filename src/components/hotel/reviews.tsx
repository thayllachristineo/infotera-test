"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StarRating } from "@/components/ui/star-rating";
import { ErrorState } from "@/components/ui/status";
import { getReviews } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/query-keys";
import { REVIEW_PAGE_SIZE } from "@/lib/constants";
import { formatDateBR } from "@/lib/format";
import { IMAGE_BLUR } from "@/lib/images";

export function Reviews({ hotelId }: { hotelId: number }) {
  const [page, setPage] = useState(1);
  const reviews = useQuery({
    queryKey: queryKeys.reviews(hotelId, page),
    queryFn: () => getReviews(hotelId, page),
  });

  if (reviews.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  if (reviews.isError) {
    return (
      <ErrorState
        title="As avaliações não carregaram"
        message={
          reviews.error instanceof Error ? reviews.error.message : undefined
        }
        onRetry={() => void reviews.refetch()}
      />
    );
  }

  const data = reviews.data;
  if (!data || data.reviews.length === 0) {
    return (
      <p className="text-sm text-muted">Ainda não há avaliações publicadas.</p>
    );
  }

  const pages = Math.max(1, Math.ceil(data.total / REVIEW_PAGE_SIZE));

  return (
    <div>
      <ul className="flex flex-col gap-4">
        {data.reviews.map((review) => (
          <li
            key={review.id}
            className="rounded-3xl border border-line bg-paper p-4"
          >
            <div className="flex items-center gap-3">
              <Image
                src={review.guestAvatar}
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
                placeholder="blur"
                blurDataURL={IMAGE_BLUR}
              />
              <div>
                <p className="font-medium">
                  {review.guestName}
                  {review.verified ? (
                    <span className="ml-2 text-xs text-pine">verificado</span>
                  ) : null}
                </p>
                <p className="text-xs text-muted">
                  {formatDateBR(review.date)}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <StarRating value={review.rating} />
            </div>
            <h3 className="mt-2 font-medium">{review.title}</h3>
            <p className="mt-1 text-sm text-muted">{review.comment}</p>
            <p className="mt-2 text-xs text-muted">
              {review.helpful} pessoas acharam útil
            </p>
          </li>
        ))}
      </ul>
      {pages > 1 ? (
        <div className="mt-4 flex items-center justify-between">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
          >
            Anteriores
          </Button>
          <p className="text-sm text-muted">
            Página {page} de {pages}
          </p>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= pages}
            onClick={() => setPage((current) => current + 1)}
          >
            Próximas
          </Button>
        </div>
      ) : null}
    </div>
  );
}
