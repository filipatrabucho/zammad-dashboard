import { useEffect, useState } from 'react';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

/**
 * Alterna automaticamente entre `slides` (cada um: { key, className,
 * content }) de tempos a tempos, com setas/pontos para navegar
 * manualmente — a navegação manual reinicia a contagem para o próximo
 * avanço automático, para não saltar logo a seguir.
 */
export default function WallboardCarousel({ slides, intervalSeconds = 20 }) {
  const [index, setIndex] = useState(0);
  const count = slides.length;

  useEffect(() => {
    if (index >= count) setIndex(0);
  }, [count, index]);

  useEffect(() => {
    if (count <= 1) return undefined;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, Math.max(5, intervalSeconds) * 1000);
    return () => clearInterval(id);
  }, [count, intervalSeconds, index]);

  if (count === 0) return null;

  const goTo = (i) => setIndex(((i % count) + count) % count);
  const slide = slides[Math.min(index, count - 1)];

  return (
    <div className="wallboard-carousel">
      <div key={slide.key} className={`wallboard-charts wallboard-carousel-slide ${slide.className || ''}`}>
        {slide.content}
      </div>

      {count > 1 && (
        <div className="wallboard-carousel-controls">
          <button
            type="button"
            className="wallboard-carousel-arrow"
            onClick={() => goTo(index - 1)}
            aria-label="Slide anterior"
          >
            <LeftOutlined />
          </button>
          <div className="wallboard-carousel-dots">
            {slides.map((s, i) => (
              <button
                key={s.key}
                type="button"
                className={`wallboard-carousel-dot ${i === index ? 'active' : ''}`}
                onClick={() => goTo(i)}
                aria-label={`Ir para o slide ${i + 1}`}
              />
            ))}
          </div>
          <button
            type="button"
            className="wallboard-carousel-arrow"
            onClick={() => goTo(index + 1)}
            aria-label="Próximo slide"
          >
            <RightOutlined />
          </button>
        </div>
      )}
    </div>
  );
}
