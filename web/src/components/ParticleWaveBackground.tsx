import { useEffect, useRef } from 'react';

/**
 * ParticleWaveBackground — a login wallpaper for Beyond Tomorrow.
 *
 * Three fine threads of dots (Pathways · Funding · Support) start wide apart at the
 * bottom-left, braid around each other as they climb, and draw together into one
 * bright thread that rises toward the top-right. Along the way their colours
 * lighten into a single white — separate steps becoming one journey.
 * A slow pulse of light travels the path now and then. Dots part and swirl softly
 * around the cursor. Transparent canvas.
 */
export interface ParticleWaveBackgroundProps {
  /** Strand colours: [pathways, funding, support]. Defaults to the site palette. */
  colors?: [string, string, string];
  /** Colour the strands lighten into once they unite. */
  unity?: string;
  /** Dot count multiplier. */
  density?: number;
  /** Fade the flow on one side so a login form stays readable. */
  calm?: 'left' | 'right' | 'none';
  /** Dots react to the cursor when true. */
  interactive?: boolean;
  /** Flow speed multiplier. */
  speed?: number;
  className?: string;
}

interface Dot {
  s: number; // progress along the path, 0..1
  strand: number;
  lane: number; // across the thread
  speed: number;
  seed: number;
  size: number;
  alpha: number;
  ox: number; // cursor displacement
  oy: number;
}
interface Mote {
  x: number;
  y: number;
  v: number;
  seed: number;
  size: number;
  alpha: number;
}

// Beyond Tomorrow palette: --primary, --accent, and a lighter sky tint of the primary.
const BRAND_COLORS: [string, string, string] = ['#2563eb', '#9333ea', '#38bdf8'];
const BRAND_UNITY = '#f8fafc'; // the strands become one clean white light

const TAU = Math.PI * 2;
const N = 200; // samples along the path
const LEVELS = 5; // colour steps between strand colour and unity
const CONVERGE = 0.78; // where the three threads become one

const sm = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const gauss = () => ((Math.random() + Math.random() + Math.random()) / 3) * 2 - 1;
const rgb = (c: string) => {
  const n = parseInt(c.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
};
const mix = (a: string, b: string, t: number) => {
  const [r1, g1, b1] = rgb(a);
  const [r2, g2, b2] = rgb(b);
  return `rgb(${Math.round(r1 + (r2 - r1) * t)},${Math.round(g1 + (g2 - g1) * t)},${Math.round(b1 + (b2 - b1) * t)})`;
};
function sprite(color: string) {
  const c = document.createElement('canvas');
  c.width = c.height = 24;
  const g = c.getContext('2d')!;
  g.fillStyle = color;
  g.beginPath();
  g.arc(12, 12, 11, 0, TAU);
  g.fill();
  return c;
}

export function ParticleWaveBackground({
  colors = BRAND_COLORS,
  unity = BRAND_UNITY,
  density = 1,
  calm = 'none',
  speed = 1,
  interactive = true,
  className,
}: ParticleWaveBackgroundProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const colorKey = colors.join(',') + unity;

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const host = canvas.parentElement ?? canvas;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // sprites[strand][level]; level LEVELS-1 is pure unity
    const sprites = colors.map((c) => Array.from({ length: LEVELS }, (_, l) => sprite(mix(c, unity, l / (LEVELS - 1)))));
    const moteSprite = sprite(unity);

    let w = 1, h = 1, raf = 0, last = 0;
    let running = false, inView = true, ready = false;
    let T = rand(0, 60);
    let dots: Dot[] = [];
    let motes: Mote[] = [];
    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, vx: 0, vy: 0, active: false };
    let leanX = 0, leanY = 0; // the whole braid leans gently toward the cursor
    const R = 150;

    // path tables, rebuilt each frame (cheap) so the whole braid can sway
    const cx = new Float32Array(N + 1), cy = new Float32Array(N + 1);
    const nx = new Float32Array(N + 1), ny = new Float32Array(N + 1);
    const wd = new Float32Array(N + 1);
    const off = [0, 1, 2].map(() => new Float32Array(N + 1));

    const buildPath = () => {
      const P = [
        [-0.08, 1.02],
        [0.3 + 0.04 * Math.sin(0.13 * T + 1) + leanX * 0.05, 1.0 + 0.03 * Math.sin(0.1 * T) + leanY * 0.05],
        [0.58 + 0.05 * Math.sin(0.09 * T + 2) + leanX * 0.05, 0.12 + 0.06 * Math.sin(0.12 * T) + leanY * 0.05],
        [1.08, 0.02],
      ].map(([x, y]) => [x! * w, y! * h] as const);
      const [p0, p1, p2, p3] = P as [readonly [number, number], readonly [number, number], readonly [number, number], readonly [number, number]];
      for (let i = 0; i <= N; i++) {
        const s = i / N, u = 1 - s;
        cx[i] = u * u * u * p0[0] + 3 * u * u * s * p1[0] + 3 * u * s * s * p2[0] + s * s * s * p3[0];
        cy[i] = u * u * u * p0[1] + 3 * u * u * s * p1[1] + 3 * u * s * s * p2[1] + s * s * s * p3[1];
        const tx = 3 * u * u * (p1[0] - p0[0]) + 6 * u * s * (p2[0] - p1[0]) + 3 * s * s * (p3[0] - p2[0]);
        const ty = 3 * u * u * (p1[1] - p0[1]) + 6 * u * s * (p2[1] - p1[1]) + 3 * s * s * (p3[1] - p2[1]);
        const len = Math.hypot(tx, ty) || 1;
        nx[i] = -ty / len;
        ny[i] = tx / len;
        const f = 1 - sm(s / CONVERGE);
        const spread = h * (0.02 + 0.2 * f + 0.05 * sm((s - 0.8) / 0.2));
        wd[i] = h * (0.006 + 0.02 * f);
        for (let k = 0; k < 3; k++) {
          // braid: each strand weaves around the centre line, tightening as they unite
          off[k]![i] = spread * Math.sin((TAU * k) / 3 + s * 5.5 - T * 0.22) + h * 0.012 * Math.sin(s * 18 - T * 0.9 + k * 2);
        }
      }
    };

    const populate = () => {
      const per = Math.round(Math.min(1100, Math.max(350, (w + h) * 0.45)) * density);
      dots = Array.from({ length: per * 3 }, (_, i) => {
        const depth = Math.random();
        return {
          s: Math.random(),
          strand: i % 3,
          lane: gauss(),
          speed: 0.75 + Math.random() * 0.5,
          seed: Math.random() * TAU,
          size: 1.5 + depth * depth * 1.8,
          alpha: 0.4 + depth * 0.55,
          ox: 0,
          oy: 0,
        };
      });
      motes = Array.from({ length: Math.round(per * 0.5) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        v: rand(5, 14),
        seed: Math.random() * TAU,
        size: rand(0.7, 1.3),
        alpha: rand(0.1, 0.28),
      }));
    };

    const zone = (x: number) => {
      if (calm === 'none') return 1;
      const p = x / w;
      return 0.22 + 0.78 * sm(((calm === 'left' ? p : 1 - p) - 0.12) / 0.4);
    };

    const frame = (dt: number) => {
      T += dt;
      const ease = Math.min(1, dt * 8);
      if (mouse.active) {
        mouse.x += (mouse.tx - mouse.x) * ease;
        mouse.y += (mouse.ty - mouse.y) * ease;
      }
      mouse.vx *= Math.pow(0.9, dt * 60);
      mouse.vy *= Math.pow(0.9, dt * 60);
      const lean = Math.min(1, dt * 2);
      leanX += ((mouse.active ? mouse.x / w - 0.5 : 0) - leanX) * lean;
      leanY += ((mouse.active ? mouse.y / h - 0.5 : 0) - leanY) * lean;
      const decay = Math.pow(0.93, dt * 60);
      buildPath();
      const surge = (0.9 + 0.12 * Math.sin(T * 0.31)) * speed;
      const pulseS = (T * 0.06) % 1.5; // a slow wave of light travelling the path

      ctx.clearRect(0, 0, w, h);

      for (const d of dots) {
        d.s += d.speed * 0.034 * surge * dt;
        if (d.s > 1) {
          d.s -= 1;
          d.lane = gauss();
        }
        const f = d.s * N;
        const i = Math.min(N - 1, f | 0);
        const t = f - i;
        const k = d.strand;
        const o = off[k]!;
        const across =
          o[i]! + (o[i + 1]! - o[i]!) * t +
          (d.lane + 0.25 * Math.sin(T * 0.6 + d.seed)) * (wd[i]! + (wd[i + 1]! - wd[i]!) * t);
        let x = cx[i]! + (cx[i + 1]! - cx[i]!) * t + (nx[i]! + (nx[i + 1]! - nx[i]!) * t) * across;
        let y = cy[i]! + (cy[i + 1]! - cy[i]!) * t + (ny[i]! + (ny[i + 1]! - ny[i]!) * t) * across;

        // cursor: dots part around it with a slight swirl, then ease back into the thread
        let near = 0;
        if (interactive && mouse.active) {
          const rx = x + d.ox - mouse.x;
          const ry = y + d.oy - mouse.y;
          const d2 = rx * rx + ry * ry;
          if (d2 < R * R && d2 > 0.01) {
            const dd = Math.sqrt(d2);
            near = (1 - dd / R) ** 2;
            d.ox += (rx / dd) * near * 4 - (ry / dd) * near * 1.2 + mouse.vx * near * 0.1;
            d.oy += (ry / dd) * near * 4 + (rx / dd) * near * 1.2 + mouse.vy * near * 0.1;
          }
        }
        d.ox *= decay;
        d.oy *= decay;
        x += d.ox;
        y += d.oy;
        if (x < -6 || x > w + 6 || y < -6 || y > h + 6) continue;

        const pulse = Math.exp(-(((d.s - pulseS) / 0.07) ** 2));
        const edge = sm(d.s / 0.06) * sm((1 - d.s) / 0.1);
        const a = Math.min(1, d.alpha * (0.88 + 0.12 * Math.sin(T * 2 + d.seed)) * (1 + 0.7 * pulse + 0.9 * near) * edge * zone(x));
        if (a < 0.02) continue;
        const level = Math.round(sm((d.s - 0.55) / 0.35) * (LEVELS - 1));
        const size = d.size * (0.85 + 0.5 * sm(d.s / CONVERGE)) * (1 + 0.25 * pulse + 0.4 * near);

        ctx.globalAlpha = a;
        ctx.drawImage(sprites[k]![level]!, x - size / 2, y - size / 2, size, size);
      }

      // faint ambient dust drifting the same way, for depth
      for (const m of motes) {
        m.x += m.v * 0.9 * surge * dt;
        m.y -= m.v * 0.4 * surge * dt;
        if (m.x > w + 4) m.x = -4;
        if (m.y < -4) m.y = h + 4;
        ctx.globalAlpha = m.alpha * (0.7 + 0.3 * Math.sin(T * 1.3 + m.seed)) * zone(m.x);
        ctx.drawImage(moteSprite, m.x - m.size / 2, m.y - m.size / 2, m.size, m.size);
      }
      ctx.globalAlpha = 1;
    };

    const setup = () => {
      const r = host.getBoundingClientRect();
      if (!r.width || !r.height) return;
      w = r.width;
      h = r.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      populate();
      ready = true;
      frame(0);
    };

    const loop = (now: number) => {
      if (!running) return;
      const dt = Math.min((now - last) / 1000 || 0.016, 0.05);
      last = now;
      frame(dt);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || reduceMotion || !inView || document.hidden || !ready) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (mouse.active) {
        mouse.vx = mouse.vx * 0.5 + (x - mouse.tx) * 0.5;
        mouse.vy = mouse.vy * 0.5 + (y - mouse.ty) * 0.5;
      } else {
        mouse.x = x;
        mouse.y = y;
        mouse.vx = mouse.vy = 0;
      }
      mouse.tx = x;
      mouse.ty = y;
      mouse.active = true;
    };
    const onLeave = () => {
      mouse.active = false;
      mouse.x = mouse.y = mouse.tx = mouse.ty = -9999;
    };
    const onVis = () => (document.hidden ? stop() : start());

    const ro = new ResizeObserver(() => {
      stop();
      setup();
      start();
    });
    ro.observe(host);
    const io = new IntersectionObserver(([e]) => {
      inView = !!e?.isIntersecting;
      inView ? start() : stop();
    });
    io.observe(canvas);
    document.addEventListener('visibilitychange', onVis);
    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerleave', onLeave);
    setup();
    start();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorKey, density, calm, speed, interactive]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={className}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', zIndex: 0, pointerEvents: 'none' }}
    />
  );
}