"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Bike, Clock, MapPin, Star } from "lucide-react";
import { restaurante } from "@/lib/pedido-data";

// Topo da tela de pedido: banner com a marca (arte oficial) + infos do restaurante.
export function RestaurantHeader() {
  return (
    <header className="relative">
      {/* Banner — a arte oficial da marca preenchendo a faixa toda. */}
      <div className="relative h-52 w-full overflow-hidden bg-black sm:h-72">
        <Image
          src="/urban-burger-logo.png"
          alt="Urban Burger"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        {/* voltar */}
        <Link
          href="/"
          className="absolute left-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-urban-surface text-urban-light transition-colors hover:bg-urban-elevated"
          aria-label="Voltar para a home"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        {/* cupom flutuante */}
        <div className="absolute right-4 top-4 rounded-full bg-urban-primary px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-urban-bg shadow-glow-sm">
          🎟️ 12% OFF · 1º pedido
        </div>
      </div>

      {/* Info do restaurante, no fundo sólido logo abaixo do banner. */}
      <div className="mx-auto max-w-3xl px-4 pt-5">
        <div className="flex items-center gap-2 text-sm">
          <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            {restaurante.status}
          </span>
          <span className="text-urban-gray">·</span>
          <span className="inline-flex items-center gap-1 text-urban-primary">
            <Star className="h-4 w-4 fill-current" /> 4,9
          </span>
        </div>

        {/* chips de infos */}
        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1 text-sm">
          <InfoChip icon={<Clock className="h-4 w-4" />} text={restaurante.entrega} />
          <InfoChip icon={<Bike className="h-4 w-4" />} text={restaurante.taxa} />
          <InfoChip icon={<MapPin className="h-4 w-4" />} text={restaurante.cidade} />
        </div>
      </div>
    </header>
  );
}

function InfoChip({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-urban-line bg-urban-surface px-3 py-1.5 text-urban-muted">
      <span className="text-urban-primary">{icon}</span>
      {text}
    </span>
  );
}
