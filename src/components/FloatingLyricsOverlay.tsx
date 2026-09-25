import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlaylistTrack } from '../types';
import { getCurrentSyncedLyric } from '../services/lyricSyncService';
import { playKeyClick } from '../utils/cyberCafeAmbience';

export interface FloatingLyric {
  id: string;
  x: number;
  y: number;
  lyric: string;
  songHint?: string;
  note: string;
  colorScheme: {
    textColor: string;
    accentColor: string;
    border: string;
    bgAura: string;
    textShadow: string;
    boxShadow: string;
  };
}

export interface FloatingEmoji {
  id: string;
  x: number;
  y: number;
  emoji: string;
  size: number;
  rotation: number;
  driftX: number;
  driftY: number;
}

// Sophisticated high-contrast palettes engineered for 100% legibility across all background brightness levels
const HIGH_LEGIBILITY_PALETTES = [
  {
    textColor: 'text-neutral-50',
    accentColor: 'text-rose-300',
    border: 'border-white/[0.16] shadow-[0_0_12px_rgba(244,63,94,0.18)]',
    bgAura: 'bg-[#070912]/85 backdrop-blur-xl',
    textShadow: '[text-shadow:_0_1.5px_4px_rgba(0,0,0,0.98),_0_0_12px_rgba(0,0,0,0.9)]',
    boxShadow: 'shadow-[0_10px_30px_rgba(0,0,0,0.75),0_0_0_1px_rgba(255,255,255,0.08)]',
  },
  {
    textColor: 'text-neutral-50',
    accentColor: 'text-amber-300',
    border: 'border-white/[0.16] shadow-[0_0_12px_rgba(245,158,11,0.18)]',
    bgAura: 'bg-[#090806]/85 backdrop-blur-xl',
    textShadow: '[text-shadow:_0_1.5px_4px_rgba(0,0,0,0.98),_0_0_12px_rgba(0,0,0,0.9)]',
    boxShadow: 'shadow-[0_10px_30px_rgba(0,0,0,0.75),0_0_0_1px_rgba(255,255,255,0.08)]',
  },
  {
    textColor: 'text-neutral-50',
    accentColor: 'text-emerald-300',
    border: 'border-white/[0.16] shadow-[0_0_12px_rgba(16,185,129,0.18)]',
    bgAura: 'bg-[#050908]/85 backdrop-blur-xl',
    textShadow: '[text-shadow:_0_1.5px_4px_rgba(0,0,0,0.98),_0_0_12px_rgba(0,0,0,0.9)]',
    boxShadow: 'shadow-[0_10px_30px_rgba(0,0,0,0.75),0_0_0_1px_rgba(255,255,255,0.08)]',
  },
  {
    textColor: 'text-neutral-50',
    accentColor: 'text-cyan-300',
    border: 'border-white/[0.16] shadow-[0_0_12px_rgba(6,182,212,0.18)]',
    bgAura: 'bg-[#04080b]/85 backdrop-blur-xl',
    textShadow: '[text-shadow:_0_1.5px_4px_rgba(0,0,0,0.98),_0_0_12px_rgba(0,0,0,0.9)]',
    boxShadow: 'shadow-[0_10px_30px_rgba(0,0,0,0.75),0_0_0_1px_rgba(255,255,255,0.08)]',
  },
  {
    textColor: 'text-neutral-50',
    accentColor: 'text-violet-300',
    border: 'border-white/[0.16] shadow-[0_0_12px_rgba(139,92,246,0.18)]',
    bgAura: 'bg-[#08060c]/85 backdrop-blur-xl',
    textShadow: '[text-shadow:_0_1.5px_4px_rgba(0,0,0,0.98),_0_0_12px_rgba(0,0,0,0.9)]',
    boxShadow: 'shadow-[0_10px_30px_rgba(0,0,0,0.75),0_0_0_1px_rgba(255,255,255,0.08)]',
  },
];

const NOTES = ['♪', '♫', '♬', '♩', '✦'];

// Thematic nostalgic 2000s cyber cafe emojis
const NOSTALGIC_THEME_EMOJIS = ['💿', '📼', '🖥️', '🕯️', '📻', '💾', '☕', '🎧', '💌', '🥀', '💽', '✨'];

// General ambient click reaction emojis
const CLICK_EMOJIS = [
  '🎵', '🎶', '💖', '✨', '🎧', '☕', '🌸', '💫', 
  '🌙', '📻', '🌧️', '🕊️', '❤️', '🌹', '💽', '🎙️', '🥀', '🤍'
];

// Helper to safely segment Bengali text into natural visual units/conjuncts
function getGraphemes(text: string): string[] {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter('bn', { granularity: 'grapheme' });
    return Array.from(segmenter.segment(text), (s) => s.segment);
  }
  return text.split('');
}

interface FloatingLyricsOverlayProps {
  isEnabled?: boolean;
  currentTrack?: PlaylistTrack | null;
  currentTime?: number;
  isPlaying?: boolean;
}

export const FloatingLyricsOverlay: React.FC<FloatingLyricsOverlayProps> = ({
  isEnabled = true,
  currentTrack,
  currentTime = 0,
  isPlaying = false,
}) => {
  // Interactive floating emojis spawned on mouse clicks / taps
  const [clickEmojisList, setClickEmojisList] = useState<FloatingEmoji[]>([]);
  // Consecutive auto-synced line managed for fluid cross-fade transitions
  const [syncedFloatingLyric, setSyncedFloatingLyric] = useState<FloatingLyric | null>(null);

  // Interactive visual expression mode: Map of char index -> replaced nostalgic emoji
  const [replacedChars, setReplacedChars] = useState<Record<number, string>>({});

  const [lyricsVersion, setLyricsVersion] = useState(0);
  const colorIndexRef = useRef(0);
  const lastSpawnTimeRef = useRef(0);
  const lastSyncedLineIndexRef = useRef<number | null>(null);
  const lastTrackIdRef = useRef<string | null>(null);

  // Listen to manual timestamp edits saved to localStorage
  useEffect(() => {
    const handleUpdate = () => {
      setLyricsVersion((v) => v + 1);
      lastSyncedLineIndexRef.current = null;
    };
    window.addEventListener('aiearnx-lyrics-updated', handleUpdate);
    return () => window.removeEventListener('aiearnx-lyrics-updated', handleUpdate);
  }, []);

  // Reset sync tracking on track change
  useEffect(() => {
    if (currentTrack?.id !== lastTrackIdRef.current) {
      lastTrackIdRef.current = currentTrack?.id || null;
      lastSyncedLineIndexRef.current = null;
      setSyncedFloatingLyric(null);
      setReplacedChars({});
    }
  }, [currentTrack?.id]);

  // Dynamic Audio Playback Sync with Framer Motion AnimatePresence cross-fade
  useEffect(() => {
    if (!isEnabled || !isPlaying || !currentTrack) {
      if (!isPlaying) {
        setSyncedFloatingLyric(null);
      }
      return;
    }

    const { activeLine, index } = getCurrentSyncedLyric(currentTrack, currentTime);

    if (lastSyncedLineIndexRef.current !== index) {
      lastSyncedLineIndexRef.current = index;
      setReplacedChars({}); // Reset interactive replacements for the incoming verse

      const screenW = typeof window !== 'undefined' ? window.innerWidth : 1000;
      const screenH = typeof window !== 'undefined' ? window.innerHeight : 800;

      // Stagger gentle organic positions across the lower-mid quadrant
      const xAnchor = (index % 2 === 0 ? 0.28 : 0.64) * screenW + (Math.sin(index * 2.1) * 35);
      const yAnchor = 0.58 * screenH + (Math.cos(index * 1.7) * 25);

      const colorScheme = HIGH_LEGIBILITY_PALETTES[colorIndexRef.current % HIGH_LEGIBILITY_PALETTES.length];
      colorIndexRef.current += 1;
      const note = NOTES[index % NOTES.length];

      setSyncedFloatingLyric({
        id: `synced-${currentTrack.id}-${index}-${Date.now()}`,
        x: Math.max(120, Math.min(screenW - 120, xAnchor)),
        y: Math.max(70, Math.min(screenH - 70, yAnchor)),
        lyric: activeLine.text,
        songHint: activeLine.hint,
        note,
        colorScheme,
      });
    }
  }, [currentTime, isPlaying, isEnabled, currentTrack, lyricsVersion]);

  // Spawn animated floating emojis on mouse clicks / taps
  const spawnClickEmojis = useCallback((clickX: number, clickY: number, customEmoji?: string) => {
    const count = customEmoji ? 1 : 2 + Math.floor(Math.random() * 2);
    const now = Date.now();
    const newItems: FloatingEmoji[] = [];

    for (let i = 0; i < count; i++) {
      const emoji = customEmoji || CLICK_EMOJIS[Math.floor(Math.random() * CLICK_EMOJIS.length)];
      const offsetX = (Math.random() - 0.5) * 30;
      const offsetY = (Math.random() - 0.5) * 20;
      const driftX = (Math.random() - 0.5) * 60;
      const driftY = -(45 + Math.random() * 60);
      const size = customEmoji ? 24 : 18 + Math.floor(Math.random() * 10);
      const rotation = (Math.random() - 0.5) * 40;

      newItems.push({
        id: `emoji-${now}-${i}-${Math.random()}`,
        x: clickX + offsetX,
        y: clickY + offsetY,
        emoji,
        size,
        rotation,
        driftX,
        driftY,
      });
    }

    setClickEmojisList((prev) => [...prev.slice(-20), ...newItems]);

    setTimeout(() => {
      const itemIds = new Set(newItems.map((n) => n.id));
      setClickEmojisList((prev) => prev.filter((item) => !itemIds.has(item.id)));
    }, 2000);
  }, []);

  // Character Click Handler: Replace character with thematic nostalgic emoji (💿, 📼, 🖥️, 🕯️)
  const handleCharacterClick = (
    e: React.MouseEvent<HTMLSpanElement>,
    charIndex: number,
    char: string
  ) => {
    e.stopPropagation(); // prevent window click listener
    playKeyClick();

    const currentReplaced = replacedChars[charIndex];
    let nextEmoji = NOSTALGIC_THEME_EMOJIS[0]; // default: 💿

    if (currentReplaced) {
      const currIdx = NOSTALGIC_THEME_EMOJIS.indexOf(currentReplaced);
      if (currIdx !== -1 && currIdx < NOSTALGIC_THEME_EMOJIS.length - 1) {
        nextEmoji = NOSTALGIC_THEME_EMOJIS[currIdx + 1];
      } else {
        // Toggle back to original text on completing the cycle
        setReplacedChars((prev) => {
          const next = { ...prev };
          delete next[charIndex];
          return next;
        });
        spawnClickEmojis(e.clientX, e.clientY, '✨');
        return;
      }
    } else {
      // Pick based on character code for deterministic initial flavor
      const code = char.charCodeAt(0) || 0;
      nextEmoji = NOSTALGIC_THEME_EMOJIS[code % 4]; // 💿, 📼, 🖥️, or 🕯️
    }

    setReplacedChars((prev) => ({
      ...prev,
      [charIndex]: nextEmoji,
    }));

    // Trigger floating burst of the newly selected nostalgic emoji
    spawnClickEmojis(e.clientX, e.clientY, nextEmoji);
  };

  // Interactive Cursor / Touch Click Handler: Convert ambient background clicks into floating emojis
  const handlePointerDown = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isEnabled) return;

      // Ignore clicks on buttons, inputs, sliders, audio progress bars, modals, or character spans
      const target = e.target as HTMLElement | null;
      if (target?.closest('button, input, textarea, a, [role="dialog"], [role="slider"], select, [data-interactive-char]')) {
        return;
      }

      let clientX = 0;
      let clientY = 0;

      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      if (clientX === 0 && clientY === 0) return;

      const now = Date.now();
      if (now - lastSpawnTimeRef.current < 90) return;
      lastSpawnTimeRef.current = now;

      spawnClickEmojis(clientX, clientY);
    },
    [isEnabled, spawnClickEmojis]
  );

  useEffect(() => {
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [handlePointerDown]);

  if (!isEnabled && clickEmojisList.length === 0 && !syncedFloatingLyric) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. Fluid Cross-Fade Transition for Consecutive Synced Lyric Lines with Interactive Character Morphing */}
      <AnimatePresence mode="wait">
        {syncedFloatingLyric && (
          <motion.div
            key={syncedFloatingLyric.id}
            initial={{ 
              opacity: 0, 
              y: 18, 
              scale: 0.95, 
              filter: 'blur(6px)' 
            }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1, 
              filter: 'blur(0px)' 
            }}
            exit={{ 
              opacity: 0, 
              y: -14, 
              scale: 0.96, 
              filter: 'blur(5px)' 
            }}
            transition={{ 
              duration: 0.75, 
              ease: [0.16, 1, 0.3, 1] 
            }}
            className="absolute pointer-events-auto"
            style={{
              left: `${syncedFloatingLyric.x}px`,
              top: `${syncedFloatingLyric.y}px`,
            }}
          >
            {/* Ethereal undulation float */}
            <div className="animate-ethereal-undulate">
              <div
                className={`px-2.5 py-0.5 sm:px-3 sm:py-0.5 rounded-full border ${syncedFloatingLyric.colorScheme.border} ${syncedFloatingLyric.colorScheme.bgAura} ${syncedFloatingLyric.colorScheme.boxShadow} flex items-center gap-1.5 max-w-[85vw] whitespace-nowrap transition-colors`}
              >
                {/* Note badge */}
                <span className={`text-[8.5px] font-bold opacity-90 animate-ethereal-shimmer ${syncedFloatingLyric.colorScheme.accentColor} drop-shadow-[0_1px_2px_rgba(0,0,0,1)]`}>
                  {syncedFloatingLyric.note}
                </span>

                {/* Interactive Visual Expression Mode: Each character can be clicked to morph into 💿, 📼, 🖥️, 🕯️ */}
                <div className="flex items-center gap-1 text-left">
                  <div
                    className={`font-bengali text-[8.5px] sm:text-[9.5px] font-normal tracking-wide ${syncedFloatingLyric.colorScheme.textColor} ${syncedFloatingLyric.colorScheme.textShadow} flex items-center flex-wrap`}
                  >
                    {getGraphemes(syncedFloatingLyric.lyric).map((char, charIdx) => {
                      const isReplaced = !!replacedChars[charIdx];
                      const displayGlyph = replacedChars[charIdx] || char;

                      if (char === ' ') {
                        return <span key={charIdx} className="inline-block w-1">&nbsp;</span>;
                      }

                      return (
                        <span
                          key={charIdx}
                          data-interactive-char="true"
                          onClick={(e) => handleCharacterClick(e, charIdx, char)}
                          className={`inline-block transition-all cursor-pointer ${
                            isReplaced
                              ? 'scale-125 px-0.5 animate-bounce drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                              : 'hover:scale-125 hover:text-amber-300 hover:drop-shadow-[0_0_6px_rgba(251,191,36,0.8)] active:scale-90'
                          }`}
                          title={
                            isReplaced 
                              ? `Nostalgic Emoji: ${displayGlyph} (Click to cycle)` 
                              : `Click letter to morph into 💿, 📼, 🖥️, 🕯️`
                          }
                        >
                          {displayGlyph}
                        </span>
                      );
                    })}
                  </div>

                  {syncedFloatingLyric.songHint && (
                    <span className="text-[6.5px] font-mono text-neutral-300/75 tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">
                      — {syncedFloatingLyric.songHint}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Interactive Floating Emojis Spawned on Mouse Clicks / Touches */}
      <AnimatePresence>
        {clickEmojisList.map((item) => (
          <motion.div
            key={item.id}
            initial={{ 
              opacity: 0, 
              scale: 0.3,
              x: item.x,
              y: item.y,
              rotate: 0,
            }}
            animate={{ 
              opacity: [0, 1, 1, 0],
              scale: [0.3, 1.25, 1.1, 0.8],
              x: item.x + item.driftX,
              y: item.y + item.driftY,
              rotate: item.rotation,
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.4,
              filter: 'blur(3px)'
            }}
            transition={{ 
              duration: 1.8, 
              ease: [0.22, 1, 0.36, 1] 
            }}
            className="absolute pointer-events-none select-none z-50 drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)] filter"
            style={{
              fontSize: `${item.size}px`,
              lineHeight: 1,
            }}
          >
            {item.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
