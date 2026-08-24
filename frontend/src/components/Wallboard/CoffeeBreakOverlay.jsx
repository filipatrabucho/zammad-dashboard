import { CloseOutlined } from '@ant-design/icons';

function CoffeeCupIllustration() {
  return (
    <svg width="150" height="150" viewBox="0 0 200 200" aria-hidden="true">
      <g className="coffee-steam">
        <path d="M72,72 Q60,50 72,34 Q84,20 72,4" stroke="#c9c7bd" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M100,72 Q88,46 100,30 Q112,14 100,-2" stroke="#c9c7bd" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M128,72 Q116,50 128,34 Q140,20 128,4" stroke="#c9c7bd" strokeWidth="6" fill="none" strokeLinecap="round" />
      </g>
      <ellipse cx="100" cy="176" rx="72" ry="12" fill="#0000001a" />
      <path d="M46,84 h108 l-10,74 a14,14 0 0 1 -14,12 h-60 a14,14 0 0 1 -14,-12 Z" fill="#eb6834" />
      <path d="M46,84 h108 l-3,22 h-102 Z" fill="#d95926" />
      <path
        d="M154,96 q34,-2 34,28 q0,30 -34,28"
        fill="none"
        stroke="#eb6834"
        strokeWidth="14"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function CoffeeBreakOverlay({ onClose }) {
  return (
    <div className="coffee-overlay" role="dialog" aria-label="Hora do café">
      <button type="button" className="coffee-close" onClick={onClose} aria-label="Fechar">
        <CloseOutlined />
      </button>
      <div className="coffee-card">
        <CoffeeCupIllustration />
        <h2>Hora do café</h2>
        <p>Já mereceste uma pausa. Volta já!</p>
      </div>
    </div>
  );
}
