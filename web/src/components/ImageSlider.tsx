import { useEffect, useState } from 'react';

export interface SliderImage {
  src: string;
  alt: string;
}

interface ImageSliderProps {
  images: readonly SliderImage[];
  label: string;
  intervalMs?: number;
}

export function ImageSlider({ images, label, intervalMs = 4000 }: ImageSliderProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = images.length;

  useEffect(() => {
    if (paused || count < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [paused, count, intervalMs]);

  if (count === 0) return null;

  const goTo = (target: number) => setIndex((target + count) % count);

  return (
    <div
      className="inst-slider"
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="inst-slider-viewport">
        <div
          className="inst-slider-track"
          style={{ transform: `translateX(-${index * 100}%)` }}
          aria-live={paused ? 'polite' : 'off'}
        >
          {images.map((image, i) => (
            <img
              key={image.src}
              src={image.src}
              alt={image.alt}
              loading="lazy"
              aria-hidden={i !== index}
            />
          ))}
        </div>
      </div>

      {count > 1 && (
        <div className="inst-slider-controls">
          <button
            type="button"
            className="inst-slider-btn"
            onClick={() => goTo(index - 1)}
            aria-label="Previous image"
          >
            &lsaquo;
          </button>

          <div className="inst-slider-dots">
            {images.map((image, i) => (
              <button
                key={image.src}
                type="button"
                className="inst-slider-dot"
                onClick={() => goTo(i)}
                aria-label={`Show image ${i + 1} of ${count}`}
                aria-current={i === index}
              />
            ))}
          </div>

          <button
            type="button"
            className="inst-slider-btn"
            onClick={() => goTo(index + 1)}
            aria-label="Next image"
          >
            &rsaquo;
          </button>
        </div>
      )}
    </div>
  );
}
