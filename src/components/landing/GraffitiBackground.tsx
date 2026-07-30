// Camada decorativa de fundo: respingos/splatter de spray + traços de concreto.
// Discreto, atrás do conteúdo — dá a "alma de rua" sem competir com o texto.
export function GraffitiBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* brilho radial laranja no topo */}
      <div className="absolute inset-0 bg-radial-orange" />
      {/* textura de concreto (grão) */}
      <div className="absolute inset-0 bg-grain opacity-[0.06] mix-blend-overlay" />

      {/* anel de spray, ecoando o logo */}
      <svg
        className="absolute -right-24 top-10 h-[520px] w-[520px] text-urban-line opacity-40"
        viewBox="0 0 200 200"
        fill="none"
      >
        <circle
          cx="100"
          cy="100"
          r="86"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray="6 14"
          strokeLinecap="round"
        />
      </svg>

      {/* respingos de spray laranja */}
      <svg
        className="absolute left-[-40px] top-1/3 h-64 w-64 text-urban-primary opacity-[0.12]"
        viewBox="0 0 100 100"
      >
        <circle cx="20" cy="30" r="6" fill="currentColor" />
        <circle cx="45" cy="20" r="3" fill="currentColor" />
        <circle cx="60" cy="45" r="8" fill="currentColor" />
        <circle cx="30" cy="60" r="4" fill="currentColor" />
        <circle cx="75" cy="70" r="2.5" fill="currentColor" />
        <circle cx="15" cy="75" r="3" fill="currentColor" />
      </svg>
    </div>
  );
}
