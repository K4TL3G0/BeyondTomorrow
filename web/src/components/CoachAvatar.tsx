import { useEffect, useId, useRef } from 'react';
import './coach-avatar.css';

export type CoachMood = 'idle' | 'thinking' | 'happy' | 'concerned' | 'celebrating' | 'laughing';

const MOOD_LABEL: Record<CoachMood, string> = {
  idle: 'calm and attentive',
  thinking: 'thinking',
  happy: 'pleased',
  concerned: 'concerned',
  celebrating: 'celebrating',
  laughing: 'giggling',
};

// Palette: change these to restyle her.
const SKIN = '#a96b45';
const SKIN_SHADE = '#8a5236';
const BLUSH = '#d9705a';
const HAIR = '#36363d';
const HAIR_LIGHT = '#7d7d89';
const LINE = '#241712';
const LIP = '#9a4448';
const FRAME = '#c9a24b';
const TUX = '#0d1220';
const SATIN = '#1f2740';
const GOLD = '#c9a24b';

const LAUGH_MOUTH = 'M89 120.5 Q100 123.5 111 120.5 Q109 134 100 134 Q91 134 89 120.5Z';

type Curl = { x: number; y: number; r: number };

// Deterministic pseudo-random so server and client render the same curls.
function seeded(seed: number) {
  let t = seed;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function buildBackCurls(): Curl[] {
  const rand = seeded(7);
  const curls: Curl[] = [];
  for (let i = 0; i < 30; i += 1) {
    const t = (i / 30) * Math.PI * 2;
    if (Math.sin(t) > 0.55 && Math.abs(Math.cos(t)) < 0.55) continue;
    curls.push({ x: 100 + Math.cos(t) * (53 + rand() * 6), y: 92 + Math.sin(t) * (56 + rand() * 6), r: 11 + rand() * 4 });
  }
  for (let y = 120; y <= 158; y += 13) {
    curls.push({ x: 44 + rand() * 5, y, r: 11 + rand() * 3 });
    curls.push({ x: 156 - rand() * 5, y, r: 11 + rand() * 3 });
  }
  for (const x of [54, 65, 76, 87]) {
    curls.push({ x: x + rand() * 3, y: 150 + rand() * 4, r: 11 + rand() * 2 });
    curls.push({ x: 200 - x - rand() * 3, y: 150 + rand() * 4, r: 11 + rand() * 2 });
  }
  return curls;
}

function buildFrontCurls(): Curl[] {
  const rand = seeded(23);
  const spots: [number, number][] = [
    [58, 100], [60, 84], [66, 68], [77, 57], [90, 51], [104, 50], [118, 53], [130, 61], [138, 74], [142, 90], [143, 106],
    [53, 118], [147, 120],
  ];
  return spots.map(([x, y]) => ({ x: x + (rand() - 0.5) * 3, y: y + (rand() - 0.5) * 3, r: 8.5 + rand() * 3 }));
}

const BACK_CURLS = buildBackCurls();
const FRONT_CURLS = buildFrontCurls();

function curlHighlight({ x, y, r }: Curl): string {
  const rr = r * 0.62;
  const a1 = -2.6;
  const a2 = -0.8;
  const f = (n: number) => n.toFixed(1);
  return `M${f(x + rr * Math.cos(a1))} ${f(y + rr * Math.sin(a1))} A${f(rr)} ${f(rr)} 0 0 1 ${f(x + rr * Math.cos(a2))} ${f(y + rr * Math.sin(a2))}`;
}

function Curls({ curls, className }: { curls: Curl[]; className?: string }) {
  return (
    <g className={className}>
      {curls.map((c, i) => <circle key={`c${i}`} cx={c.x.toFixed(1)} cy={c.y.toFixed(1)} r={c.r.toFixed(1)} fill={HAIR} />)}
      {curls.map((c, i) => <path key={`h${i}`} d={curlHighlight(c)} fill="none" stroke={HAIR_LIGHT} strokeWidth="1.6" strokeLinecap="round" opacity=".75" />)}
    </g>
  );
}

function browPaths(mood: CoachMood): { l: string; r: string } {
  switch (mood) {
    case 'laughing':
      return { l: 'M72 80 Q83 74.5 94 79', r: 'M106 79 Q117 74.5 128 80' };
    case 'happy':
      return { l: 'M72 81.5 Q83 76.5 94 80.5', r: 'M106 80.5 Q117 76.5 128 81.5' };
    case 'celebrating':
      return { l: 'M72 79 Q83 74 94 78', r: 'M106 78 Q117 74 128 79' };
    case 'concerned':
      return { l: 'M72 86 Q83 82 94 77.5', r: 'M106 77.5 Q117 82 128 86' };
    case 'thinking':
      return { l: 'M72 80 Q83 74 94 78', r: 'M106 82 Q117 78 128 83' };
    default:
      return { l: 'M72 83 Q83 78 94 82', r: 'M106 82 Q117 78 128 83' };
  }
}

function Mouth({ mood, clipId }: { mood: CoachMood; clipId: string }) {
  switch (mood) {
    case 'laughing':
      return (
        <g>
          <defs>
            <clipPath id={clipId}><path d={LAUGH_MOUTH} /></clipPath>
          </defs>
          {/* The jaw group is what bobs open and shut. */}
          <g className="ca-jaw">
            <path d={LAUGH_MOUTH} fill="#5a1626" />
            <g clipPath={`url(#${clipId})`}>
              <ellipse cx="100" cy="132" rx="5.5" ry="3.4" fill="#e58a99" />
              <path d="M88 118 L112 118 L112 124.2 Q100 126.4 88 124.2Z" fill="#fffaf5" />
            </g>
            <path d={LAUGH_MOUTH} fill="none" stroke={LIP} strokeWidth="2.2" strokeLinejoin="round" />
          </g>
        </g>
      );
    case 'happy':
      return <path d="M90 121 Q100 134 110 121 Q100 125 90 121Z" fill={LIP} />;
    case 'celebrating':
      return (
        <>
          <path d="M88.5 120 Q100 140 111.5 120 Q100 124 88.5 120Z" fill="#7a2432" />
          <path d="M91 121.2 Q100 125 109 121.2 Q100 128 91 121.2Z" fill="#fffaf5" />
        </>
      );
    case 'concerned':
      return <path d="M93 127 Q100 122.5 107 127" fill="none" stroke={LIP} strokeWidth="2.8" strokeLinecap="round" />;
    case 'thinking':
      return <path d="M94 125.5 Q101 127.5 107 123" fill="none" stroke={LIP} strokeWidth="2.8" strokeLinecap="round" />;
    default:
      return (
        <>
          <path d="M91.5 123 Q96 120.5 100 122.2 Q104 120.5 108.5 123 Q100 131 91.5 123Z" fill={LIP} />
          <path d="M91.5 123 Q100 126 108.5 123" fill="none" stroke="#6e2c32" strokeWidth="1" strokeLinecap="round" />
        </>
      );
  }
}

function Eye({ cx, clipId, closed }: { cx: number; clipId: string; closed: boolean }) {
  if (closed) {
    return <path d={`M${cx - 6.5} 102 Q${cx} 93.5 ${cx + 6.5} 102`} fill="none" stroke={LINE} strokeWidth="2.6" strokeLinecap="round" />;
  }
  return (
    <g>
      <ellipse cx={cx} cy="100" rx="8.4" ry="7.2" fill="#fffdfa" />
      <g clipPath={`url(#${clipId})`}>
        <g className="ca-iris">
          <circle cx={cx} cy="100" r="5.6" fill="#b07a2e" />
          <circle cx={cx} cy="100" r="5.6" fill="none" stroke="#5a3a14" strokeWidth="1" />
          <circle cx={cx} cy="100" r="2.6" fill="#120a07" />
          <circle cx={cx + 2} cy="97.6" r="1.6" fill="#fff" />
          <circle cx={cx - 2} cy="102.4" r=".8" fill="#fff" opacity=".8" />
        </g>
      </g>
      <path d={`M${cx - 8.4} 100 Q${cx} 91.2 ${cx + 8.4} 100`} fill="none" stroke={LINE} strokeWidth="2.2" strokeLinecap="round" />
      <path d={`M${cx - 8.4} 100 L${cx - 10.6} 98.2`} stroke={LINE} strokeWidth="1.6" strokeLinecap="round" />
    </g>
  );
}

const HA_WORDS = ['hehe', 'hehe'];

export interface CoachAvatarProps {
  mood?: CoachMood;
  /** Pixel size of the round portrait. */
  size?: number;
  name?: string;
  /** Eyes and head follow the pointer a little. Ignored when reduced motion is on. */
  lookAtPointer?: boolean;
  onClick?: () => void;
}

export function CoachAvatar({
  mood = 'idle',
  size = 112,
  name = 'Naledi',
  lookAtPointer = true,
  onClick,
}: CoachAvatarProps) {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const clipL = `ca-l-${rawId}`;
  const clipR = `ca-r-${rawId}`;
  const clipMouth = `ca-m-${rawId}`;
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!lookAtPointer || !el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = el.getBoundingClientRect();
        const dx = event.clientX - (box.left + box.width / 2);
        const dy = event.clientY - (box.top + box.height / 2);
        const distance = Math.hypot(dx, dy) || 1;
        const strength = Math.min(1, distance / 320);
        el.style.setProperty('--lx', `${((dx / distance) * strength * 2.4).toFixed(2)}px`);
        el.style.setProperty('--ly', `${((dy / distance) * strength * 1.8).toFixed(2)}px`);
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
    };
  }, [lookAtPointer]);

  const brows = browPaths(mood);
  const laughing = mood === 'laughing';
  const closedEyes = mood === 'celebrating' || laughing;

  return (
    <span className="ca-wrap">
      <span
        ref={ref}
        className="ca"
        data-mood={mood}
        style={{ width: size, height: size, cursor: onClick ? 'pointer' : undefined }}
        onClick={onClick}
        onKeyDown={
          onClick
            ? (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={`${name}, your readiness coach, looking ${MOOD_LABEL[mood]}${onClick ? `. Activate to make ${name} laugh.` : ''}`}
        title={onClick ? `Click to make ${name} laugh!` : undefined}
      >
        <svg viewBox="0 0 200 220" role="img" aria-label={`${name}, your readiness coach, looking ${MOOD_LABEL[mood]}`}>
          <defs>
            <clipPath id={clipL}><ellipse cx="83" cy="100" rx="8.4" ry="7.2" /></clipPath>
            <clipPath id={clipR}><ellipse cx="117" cy="100" rx="8.4" ry="7.2" /></clipPath>
          </defs>

          <g className="ca-body">
            <g transform="translate(0 4)">
              {/* Tuxedo jacket */}
              <path d="M12 220 C12 186 44 168 84 160 L100 214 L116 160 C156 168 188 186 188 220Z" fill={TUX} />
              {/* Dress shirt */}
              <path d="M86 159 L100 214 L114 159 Q100 173 86 159Z" fill="#fbfbfd" />
              <path d="M92 190 L100 214 L108 190" fill="none" stroke="#e3e6ee" strokeWidth="1" />
              <circle cx="100" cy="184" r="1.7" fill={GOLD} />
              <circle cx="100" cy="196" r="1.7" fill={GOLD} />
              {/* Satin peak lapels */}
              <path d="M84 160 L100 214 L78 206 L62 184 L74 176 L68 168Z" fill={SATIN} />
              <path d="M116 160 L100 214 L122 206 L138 184 L126 176 L132 168Z" fill={SATIN} />
              <path d="M84 160 L68 168 L74 176" fill="none" stroke="#33405f" strokeWidth="1.2" strokeLinejoin="round" />
              <path d="M116 160 L132 168 L126 176" fill="none" stroke="#33405f" strokeWidth="1.2" strokeLinejoin="round" />
              {/* Collar wings and bow tie */}
              <path d="M91 157 L83 161 L95 172Z M109 157 L117 161 L105 172Z" fill="#fbfbfd" />
              <path d="M100 168 L84 160 L84 176Z" fill="#05070d" />
              <path d="M100 168 L116 160 L116 176Z" fill="#05070d" />
              <path d="M88 164 L96 167.5" stroke="#2c3550" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M112 164 L104 167.5" stroke="#2c3550" strokeWidth="1.2" strokeLinecap="round" />
              <rect x="96" y="163" width="8" height="10" rx="3" fill="#05070d" />
            </g>
          </g>

          <g className="ca-head">
            {/* Curly hair behind the shoulders and neck */}
            <ellipse cx="100" cy="96" rx="52" ry="58" fill={HAIR} />
            <path d="M46 110 L154 110 L152 142 L48 142Z" fill={HAIR} />
            <Curls curls={BACK_CURLS} className="ca-curls-back" />

            {/* Neck */}
            <path d="M90 134 L90 162 Q100 172 110 162 L110 134Z" fill={SKIN} />
            <path d="M90 140 Q100 150 110 140 L110 134 L90 134Z" fill={SKIN_SHADE} opacity=".7" />

            {/* Face */}
            <path d="M56 92 C56 58 76 46 100 46 C124 46 144 58 144 92 C144 124 124 149 100 149 C76 149 56 124 56 92Z" fill={SKIN} />
            <path d="M70 126 C77 142 89 148 100 148 C111 148 123 142 130 126 C121 140 111 144 100 144 C89 144 79 140 70 126Z" fill={SKIN_SHADE} opacity=".4" />
            <ellipse className="ca-blush" cx="70" cy="116" rx="9" ry="5.2" fill={BLUSH} opacity={laughing ? 0.6 : 0.45} />
            <ellipse className="ca-blush" cx="130" cy="116" rx="9" ry="5.2" fill={BLUSH} opacity={laughing ? 0.6 : 0.45} />

            {/* Curly fringe and side curls */}
            <Curls curls={FRONT_CURLS} className="ca-curls-front" />

            {/* Cheeks pushed up by a big laugh */}
            {laughing && (
              <g className="ca-cheeks">
                <ellipse cx="83" cy="110.5" rx="10" ry="3.8" fill={SKIN} />
                <ellipse cx="117" cy="110.5" rx="10" ry="3.8" fill={SKIN} />
                                              </g>
            )}

            {/* Brows, eyes, round glasses, hoops, nose, mouth */}
            <g className="ca-brows" fill="none" stroke={LINE} strokeWidth="3" strokeLinecap="round">
              <path d={brows.l} />
              <path d={brows.r} />
            </g>
            <g className="ca-eyes">
              <Eye cx={83} clipId={clipL} closed={closedEyes} />
              <Eye cx={117} clipId={clipR} closed={closedEyes} />
            </g>
            <g className="ca-glasses">
              <g fill="#ffffff" fillOpacity=".12" stroke={FRAME} strokeWidth="2.4">
                <circle cx="83" cy="100" r="14" />
                <circle cx="117" cy="100" r="14" />
              </g>
              <path d="M97 98.5 Q100 96 103 98.5" fill="none" stroke={FRAME} strokeWidth="2.2" strokeLinecap="round" />
              <path d="M69 98 L63 97 M131 98 L137 97" stroke={FRAME} strokeWidth="2" strokeLinecap="round" />
              <path d="M75 92 Q79 89 83 89.5" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity=".6" />
            </g>

            <g className="ca-hoops" fill="none" stroke={GOLD} strokeWidth="2.2">
              <circle cx="56" cy="128" r="8.5" />
              <circle cx="144" cy="128" r="8.5" />
            </g>
            <path d="M95.5 112.5 Q100 117 104.5 112.5" fill="none" stroke={SKIN_SHADE} strokeWidth="1.8" strokeLinecap="round" />
            <ellipse cx="100" cy="109" rx="2" ry="1.4" fill="#d79a74" opacity=".6" />
            <Mouth mood={mood} clipId={clipMouth} />
          </g>

          {mood === 'thinking' && (
            <g className="ca-dots" fill="#2457c5">
              <circle cx="152" cy="62" r="2.4" />
              <circle cx="162" cy="50" r="3.2" />
              <circle cx="175" cy="38" r="4.2" />
            </g>
          )}
          {mood === 'celebrating' && (
            <g className="ca-sparkles" fill="#f3c969">
              <path d="M32 52 L35 60 L43 63 L35 66 L32 74 L29 66 L21 63 L29 60Z" />
              <path d="M168 40 L170.5 46 L176.5 48.5 L170.5 51 L168 57 L165.5 51 L159.5 48.5 L165.5 46Z" />
              <path d="M160 96 L162 101 L167 103 L162 105 L160 110 L158 105 L153 103 L158 101Z" />
            </g>
          )}
        </svg>
      </span>

      {/* "hehe" puffs float above the portrait, outside its round clip. */}
      {laughing && (
        <span className="ca-ha" aria-hidden="true">
          {HA_WORDS.map((word, i) => <span key={i}>{word}</span>)}
        </span>
      )}
    </span>
  );
}