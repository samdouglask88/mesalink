import Link from "next/link";
import { Clock, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { contato } from "@/lib/landing-data";

// lucide-react removeu os ícones de marca — Instagram vai como SVG inline.
function Instagram({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Footer() {
  const wpp = `https://wa.me/${contato.whatsapp}`;
  const insta = `https://instagram.com/${contato.instagram}`;

  return (
    <footer
      id="contato"
      className="relative border-t border-urban-line bg-urban-surface/40"
    >
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Marca */}
          <div className="md:col-span-1">
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-urban-muted">
              Os burgers mais insanos da cidade. Feitos na chapa, com alma de
              rua.
            </p>
            <div className="mt-5 flex gap-3">
              <a
                href={insta}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="grid h-10 w-10 place-items-center rounded-full border border-urban-line bg-urban-surface text-urban-light transition-colors hover:border-urban-primary hover:text-urban-primary"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={wpp}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="grid h-10 w-10 place-items-center rounded-full border border-urban-line bg-urban-surface text-urban-light transition-colors hover:border-urban-primary hover:text-urban-primary"
              >
                <Phone className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-display text-sm uppercase tracking-widest text-urban-light">
              Contato
            </h4>
            <ul className="mt-4 space-y-3 text-sm text-urban-muted">
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-urban-primary" />
                {contato.horario}
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-urban-primary" />
                {contato.endereco}
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-urban-primary" />
                <a href={wpp} className="hover:text-urban-light">
                  {contato.telefone}
                </a>
              </li>
            </ul>
          </div>

          {/* Navegação */}
          <div>
            <h4 className="font-display text-sm uppercase tracking-widest text-urban-light">
              Navegar
            </h4>
            <ul className="mt-4 space-y-3 text-sm text-urban-muted">
              {[
                ["Cardápio", "#cardapio"],
                ["Promoções", "#promocoes"],
                ["Sobre", "#sobre"],
                ["Contato", "#contato"],
              ].map(([label, href]) => (
                <li key={href}>
                  <a href={href} className="hover:text-urban-light">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Pedido */}
          <div>
            <h4 className="font-display text-sm uppercase tracking-widest text-urban-light">
              Peça já
            </h4>
            <p className="mt-4 text-sm text-urban-muted">
              Faça seu pedido pelo WhatsApp ou escaneie o QR code na mesa.
            </p>
            <a
              href={wpp}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-urban-primary px-5 py-2.5 text-sm font-semibold text-urban-bg transition-colors hover:bg-urban-primary-600"
            >
              <Phone className="h-4 w-4" /> Pedir no WhatsApp
            </a>
          </div>
        </div>

        {/* Barra inferior */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-urban-line pt-6 text-xs text-urban-gray sm:flex-row">
          <p>
            © {new Date().getFullYear()} Urban Burger. Todos os direitos
            reservados.
          </p>
          <div className="flex items-center gap-4">
            <span>Feito com 🔥 no Brasil</span>
            {/* Acesso discreto da equipe (MesaLink) */}
            <Link href="/cozinha" className="hover:text-urban-muted">
              Cozinha
            </Link>
            <Link href="/caixa" className="hover:text-urban-muted">
              Caixa
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
