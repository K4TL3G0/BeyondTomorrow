import type { ReactNode } from 'react';
import { ParticleWaveBackground } from './ParticleWaveBackground';

export interface HeroProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  feature?: {
    symbol?: ReactNode;
    title: string;
    description: string;
  };
  children?: ReactNode;
}

export function Hero({ eyebrow, title, description, actions, feature, children }: HeroProps) {
  return (
    <section className="hero">
      <ParticleWaveBackground density={0.65} className="hero-wave" />
      <div className={`hero-inner${!feature ? ' single-col' : ''}`}>
        <div className="hero-copy">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          {typeof title === 'string' ? <h1>{title}</h1> : title}
          {description && (typeof description === 'string' ? <p>{description}</p> : description)}
          {actions && <div className="hero-actions">{actions}</div>}
          {children}
        </div>
        {feature && (
          <aside className="hero-feature" aria-label="Feature highlight">
            {feature.symbol && (
              <span className="feature-symbol" aria-hidden="true">
                {feature.symbol}
              </span>
            )}
            <h2>{feature.title}</h2>
            <p>{feature.description}</p>
          </aside>
        )}
      </div>
    </section>
  );
}

export default Hero;
