import { useCallback, useEffect, useRef, useState } from 'react';
import { Play, Volume2, VolumeX } from 'lucide-react';
import { deriveCoachGuide, type CoachSituation } from '../lib/coachMood';
import { CoachAvatar, type CoachMood } from './CoachAvatar';

const STEP_AUDIO: Record<CoachSituation['stage'], string> = {
  route: '/coach/audio/route.mp3',
  questions: '/coach/audio/questions.mp3',
  documents: '/coach/audio/documents.mp3',
};

interface CoachGuideProps {
  situation: CoachSituation;
  /** Number of ticked checks. When it goes up, Naledi briefly smiles. */
  tickedCount?: number;
  name?: string;
}

export function CoachGuide({ situation, tickedCount = 0, name = 'Naledi' }: CoachGuideProps) {
  const { mood: baseMood, message } = deriveCoachGuide(situation);
  const [cheer, setCheer] = useState(false);
  const [laugh, setLaugh] = useState<'off' | 'laughing' | 'settling'>('off');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [audioMessage, setAudioMessage] = useState('');
  const [isFloating, setIsFloating] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const previous = useRef(tickedCount);
  const previousStage = useRef(situation.stage);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const laughTimers = useRef<number[]>([]);

  const playStepAudio = useCallback((stage: CoachSituation['stage']) => {
    audioRef.current?.pause();
    const audio = new Audio(STEP_AUDIO[stage]);
    audioRef.current = audio;
    setAudioMessage('');
    audio.onended = () => {
      if (audioRef.current === audio) audioRef.current = null;
    };
    audio.onerror = () => {
      if (audioRef.current !== audio) return;
      audioRef.current = null;
      setAudioMessage('This step’s audio could not be played. The written guidance is still available.');
    };
    void audio.play().catch(() => {
      if (audioRef.current !== audio) return;
      audioRef.current = null;
      setAudioMessage('This step’s audio could not be played. The written guidance is still available.');
    });
  }, []);

  useEffect(() => {
    if (tickedCount > previous.current) {
      setCheer(true);
      const timer = window.setTimeout(() => setCheer(false), 1600);
      previous.current = tickedCount;
      return () => window.clearTimeout(timer);
    }
    previous.current = tickedCount;
  }, [tickedCount]);

  useEffect(() => {
    const enteredNewStage = previousStage.current !== situation.stage;
    previousStage.current = situation.stage;

    if (!soundEnabled) {
      audioRef.current?.pause();
      audioRef.current = null;
      return;
    }
    if (!enteredNewStage) return;

    playStepAudio(situation.stage);

    return () => {
      audioRef.current?.pause();
    };
  }, [situation.stage, soundEnabled, playStepAudio]);

  useEffect(
    () => () => {
      audioRef.current?.pause();
      audioRef.current = null;
      laughTimers.current.forEach((id) => window.clearTimeout(id));
    },
    [],
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        const floating = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        setIsFloating(floating);
        if (!floating) setIsCollapsed(false); // auto-expand when returning inline
      },
      {
        threshold: 0,
      },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleAvatarClick = () => {
    laughTimers.current.forEach((id) => window.clearTimeout(id));
    setLaugh('laughing');
    // A short giggle, then a moment of smiling before going back to normal.
    laughTimers.current = [
      window.setTimeout(() => setLaugh('settling'), 1800),
      window.setTimeout(() => setLaugh('off'), 2600),
    ];
  };

  const mood: CoachMood =
    laugh === 'laughing'
      ? 'laughing'
      : laugh === 'settling'
        ? 'happy'
        : cheer && baseMood === 'idle'
          ? 'happy'
          : baseMood;

  return (
    <>
      <div ref={sentinelRef} style={{ height: '1px', width: '100%' }} aria-hidden="true" />
      {isFloating && <div aria-hidden="true" style={{ height: '96px', marginBottom: '1.25rem' }} />}
      <section
        className={`coach-guide ${isFloating ? 'floating' : ''} ${isCollapsed ? 'collapsed' : ''}`}
        aria-label="Automated coach guide"
      >
        <CoachAvatar mood={mood} name={name} onClick={handleAvatarClick} />

        {isFloating && isCollapsed ? (
          <button
            type="button"
            className="coach-guide-collapsed-pill"
            onClick={() => setIsCollapsed(false)}
            aria-label="Expand coach message"
            title="Click to view coach message"
          >
            <span className="coach-dots-indicator" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span className="coach-pill-label">{name}</span>
          </button>
        ) : (
          <div className="coach-guide-bubble" data-mood={mood} key={message}>
            <div className="coach-guide-header-row">
              <strong className="coach-guide-name">{name} · automated guide</strong>
              {isFloating && (
                <button
                  type="button"
                  className="coach-guide-collapse-btn"
                  onClick={() => setIsCollapsed(true)}
                  aria-label="Collapse message into three dots"
                  title="Collapse into three dots"
                >
                  •••
                </button>
              )}
            </div>
            <p className="coach-guide-message" role="status">{message}</p>
            <div className="coach-guide-controls">
              <button
                type="button"
                className="coach-guide-sound"
                aria-pressed={soundEnabled}
                onClick={() => {
                  setAudioMessage('');
                  setSoundEnabled((enabled) => !enabled);
                }}
              >
                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                Step audio {soundEnabled ? 'on' : 'off'}
              </button>
              <button
                type="button"
                className="coach-guide-sound"
                disabled={!soundEnabled}
                onClick={() => playStepAudio(situation.stage)}
              >
                <Play size={16} /> Replay step audio
              </button>
              {audioMessage && <span className="coach-guide-audio-message" role="status">{audioMessage}</span>}
            </div>
            <p className="coach-guide-audio-note">Audio is a generic step introduction. Personal guidance stays on screen.</p>
          </div>
        )}
      </section>
    </>
  );
}