import React, { useState, useEffect, useMemo } from 'react';
import { Play, Pause, ListMusic, Music2, Clock } from 'lucide-react';
import { playKeyClick } from '../utils/cyberCafeAmbience';
import { PlaylistTrack } from '../types';
import { getCurrentSyncedLyric } from '../services/lyricSyncService';

interface HeroCenterProps {
  currentPlaylistName?: string;
  onOpenPlaylists?: () => void;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  currentTrack?: PlaylistTrack | null;
  currentTime?: number;
  onOpenLyricTimingEditor?: () => void;
}

export const HeroCenter: React.FC<HeroCenterProps> = ({
  currentPlaylistName = 'Best of 20s Bengali songs',
  onOpenPlaylists,
  isPlaying = false,
  onTogglePlay,
  currentTrack,
  currentTime = 0,
  onOpenLyricTimingEditor,
}) => {
  const [lyricsVersion, setLyricsVersion] = useState(0);

  // Listen to manual timestamp edits saved to localStorage
  useEffect(() => {
    const handleUpdate = () => {
      setLyricsVersion((v) => v + 1);
    };
    window.addEventListener('aiearnx-lyrics-updated', handleUpdate);
    return () => window.removeEventListener('aiearnx-lyrics-updated', handleUpdate);
  }, []);

  // Sync lyric line directly with the audio playback timing data
  const syncedData = useMemo(() => {
    return getCurrentSyncedLyric(currentTrack, currentTime);
  }, [currentTrack, currentTime, lyricsVersion]);

  const currentLyricLine = syncedData.activeLine.text;
  const nextLyricLine = syncedData.nextLine?.text;

  return (
    <section className="relative w-full flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 select-none pointer-events-none">
      {/* Cinematic Cyber Cafe Ambient Glow */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-30 pointer-events-none">
        <div className="w-[500px] h-[300px] sm:w-[700px] sm:h-[380px] rounded-full bg-gradient-to-b from-rose-950/20 via-sky-950/15 to-transparent blur-3xl animate-soft-pulse" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-3xl mx-auto w-full">
        {/* Subtle Editorial Top Kicker */}
        <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono tracking-[0.2em] text-neutral-400 mb-1.5 sm:mb-2 px-2.5 py-0.5 rounded-full bg-black/40 border border-white/[0.08] backdrop-blur-md shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
          <span className="uppercase">2000s Cyber Cafe Nostalgia Archive</span>
          <span aria-hidden="true" className="text-neutral-600">·</span>
          <span className="text-neutral-300 font-semibold">Cabin 04</span>
        </div>

        {/* Central Dominant H1 Branding with metallic gradient mask */}
        <h1 className="font-bengali text-6xl sm:text-7xl md:text-8xl lg:text-[7.8rem] font-bold tracking-tight bg-gradient-to-b from-white via-neutral-100 to-neutral-300 bg-clip-text text-transparent drop-shadow-[0_12px_45px_rgba(0,0,0,0.98)] leading-tight py-1 transition-all duration-700 select-none">
          মনের কথা
        </h1>

        {/* Live Song Lyrics Stage right under মনের কথা (Delicate, cinematic & non-competing) */}
        <div className="mt-1 sm:mt-2 w-full flex flex-col items-center justify-center min-h-[60px] sm:min-h-[75px] px-2 sm:px-4 pointer-events-auto">
          {/* Subtle Compact Track & Lyric Info Badge under মনের কথা */}
          <div className="flex items-center gap-1.5 text-[8px] sm:text-[9px] font-mono tracking-wider text-rose-300/80 mb-1 px-2.5 py-0.5 rounded-full bg-black/45 border border-white/[0.06] backdrop-blur-md shadow-sm">
            <span className="flex items-center gap-0.5 h-2">
              <span className={`w-0.5 bg-rose-400/90 rounded-full ${isPlaying ? 'animate-eq-1' : 'h-1'}`} />
              <span className={`w-0.5 bg-rose-400/90 rounded-full ${isPlaying ? 'animate-eq-2' : 'h-1.5'}`} />
              <span className={`w-0.5 bg-rose-400/90 rounded-full ${isPlaying ? 'animate-eq-3' : 'h-1'}`} />
            </span>
            <Music2 className="w-2.5 h-2.5 text-rose-400/80" />
            <span className="uppercase font-medium tracking-wider text-neutral-300/90 truncate max-w-[180px] sm:max-w-xs">
              {currentTrack ? `${currentTrack.title} — ${currentTrack.artist}` : 'বাংলা গানের লিরিক্স'}
            </span>
            {onOpenLyricTimingEditor && (
              <button
                onClick={() => {
                  playKeyClick();
                  onOpenLyricTimingEditor();
                }}
                className="ml-0.5 px-1.5 py-0.2 rounded bg-white/[0.06] hover:bg-rose-500/20 text-neutral-300 hover:text-rose-200 border border-white/[0.08] hover:border-rose-400/30 transition-all flex items-center gap-1 active:scale-95"
                title="Open Lyric Timing Studio Dashboard (L)"
                aria-label="Edit lyric timing"
              >
                <Clock className="w-2 h-2 text-rose-400" />
                <span className="text-[7.5px] font-mono uppercase font-semibold hidden xs:inline">TIMING</span>
              </button>
            )}
          </div>

          {/* Active Rising Song Lyric Card - Delicate Cinematic Subtitle Aesthetics */}
          <div 
            key={`${currentTrack?.id || 'idle'}-${syncedData.index}`}
            onClick={() => playKeyClick()}
            className="animate-center-lyric-rise relative flex flex-col items-center text-center max-w-xl px-3 py-1 rounded-lg bg-black/25 hover:bg-black/35 backdrop-blur-sm border border-white/[0.04] hover:border-white/[0.1] shadow-[0_4px_16px_rgba(0,0,0,0.4)] cursor-pointer active:scale-95 transition-all"
            title="Click for musical emojis ✨"
          >
            <p className="font-bengali text-xs sm:text-[13px] md:text-sm lg:text-[15px] font-normal tracking-wide text-neutral-100/90 [text-shadow:_0_1px_6px_rgba(0,0,0,0.9),_0_0_12px_rgba(244,63,94,0.25)] leading-relaxed animate-ethereal-undulate">
              "{currentLyricLine}"
            </p>

            {/* Next incoming verse hint in delicate whisper font */}
            {nextLyricLine && (
              <p className="font-bengali text-[8.5px] sm:text-[9.5px] font-normal text-neutral-400/40 mt-0.5 italic tracking-wide [text-shadow:_0_1px_3px_rgba(0,0,0,0.9)]">
                {nextLyricLine}
              </p>
            )}
          </div>
        </div>

        {/* Quick Interactive Shortcut Bar - Compact Typography */}
        {(onOpenPlaylists || onTogglePlay) && (
          <div className="mt-2.5 sm:mt-3.5 pointer-events-auto flex items-center gap-2">
            {onTogglePlay && (
              <button
                onClick={() => {
                  playKeyClick();
                  onTogglePlay();
                }}
                className="px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] active:scale-95 border border-white/[0.15] hover:border-white/30 text-neutral-200 hover:text-white transition-all duration-200 text-[10px] sm:text-[11px] font-mono flex items-center gap-1.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_4px_14px_rgba(0,0,0,0.5)] backdrop-blur-xl group"
                aria-label={isPlaying ? 'Pause music' : 'Play featured playlist'}
                title="Toggle playback (Spacebar)"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3 h-3 text-rose-400 group-hover:scale-110 transition-transform" />
                    <span>PAUSE TRANSMISSION</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 text-emerald-400 fill-emerald-400 group-hover:scale-110 transition-transform" />
                    <span className="truncate max-w-[150px] sm:max-w-none">PLAY: {currentPlaylistName}</span>
                  </>
                )}
                <span className="hidden sm:inline-block px-1 py-0.2 rounded text-[8px] bg-black/40 text-neutral-400 border border-white/10 font-mono">
                  SPACE
                </span>
              </button>
            )}

            {onOpenPlaylists && (
              <button
                onClick={() => {
                  playKeyClick();
                  onOpenPlaylists();
                }}
                className="px-2.5 py-1.5 rounded-xl bg-black/40 hover:bg-white/[0.08] active:scale-95 border border-white/[0.1] hover:border-white/20 text-neutral-300 hover:text-neutral-100 transition-all duration-200 text-[10px] sm:text-[11px] font-mono flex items-center gap-1 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]"
                aria-label="Browse all channels"
                title="Browse all playlists (P)"
              >
                <ListMusic className="w-3 h-3 text-neutral-400 group-hover:rotate-6 transition-transform" />
                <span>ALL CHANNELS</span>
                <span className="hidden sm:inline-block px-1 py-0.2 rounded text-[8px] bg-white/[0.05] text-neutral-400 border border-white/10 font-mono">
                  P
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
