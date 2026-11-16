"use client";

import { useRouter } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";
import { TERMS_TEXT } from "@/lib/constants";

export function TermsModal() {
  const router = useRouter();

  return (
    <Dialog open title="Termos e condições" onClose={() => router.back()}>
      <div className="space-y-3 text-sm leading-6 whitespace-pre-wrap">
        {TERMS_TEXT}
      </div>
    </Dialog>
  );
}
