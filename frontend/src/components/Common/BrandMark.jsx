// Ícone de suporte/headset usado como logótipo da app (ver frontend/public/favicon.svg
// para a versão usada no separador do browser). Substitui facilmente por um logo
// real: troca o <path> abaixo e o conteúdo de favicon.svg.
export default function BrandMark({ size = 32 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="brand-mark-svg"
    >
      <rect width="32" height="32" rx="8" fill="currentColor" className="brand-mark-bg" />
      <path
        d="M16 7a8 8 0 0 0-8 8v5.5A2.5 2.5 0 0 0 10.5 23H11a2 2 0 0 0 2-2v-3.5a2 2 0 0 0-2-2H9.6v-.5a6.4 6.4 0 1 1 12.8 0v.5H21a2 2 0 0 0-2 2V21a2 2 0 0 0 2 2h.5a2.5 2.5 0 0 0 2.5-2.5V15a8 8 0 0 0-8-8Z"
        fill="#ffffff"
      />
    </svg>
  );
}
