import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  ListMusic, 
  Radio,
  Disc3,
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';
import { Playlist, PlaylistTrack } from '../types';
import { playKeyClick } from '../utils/cyberCafeAmbience';

interface MainMusicPlayerProps {
  currentPlaylist: Playlist;
  currentTrack: PlaylistTrack;
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onRewind: () => void;
  onForward: () => void;
  onSeek: (seconds: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onOpenPlaylists: () => void;
}

function formatTime(sec: number): string {
  if (isNaN(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export const MainMusicPlayer: React.FC<MainMusicPlayerProps> = ({
  currentPlaylist,
  currentTrack,
  isPlaying,
  isBuffering,
  currentTime,
  duration,
  volume,
  isMuted,
  onTogglePlay,
  onPrev,
  onNext,
  onRewind,
  onForward,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onOpenPlaylists,
}) => {
  const [showVolumePopup, setShowVolumePopup] = useState(false);
  const [hoverSeekTime, setHoverSeekTime] = useState<number | null>(null);
  const [hoverSeekPercent, setHoverSeekPercent] = useState<number | null>(null);
  const [isDraggingScrubber, setIsDraggingScrubber] = useState(false);

  const progressBarRef = useRef<HTMLDivElement>(null);

  const safeDuration = Math.max(1, duration || currentTrack?.durationSeconds || 240);
  const progressPercent = safeDuration > 0 ? Math.min(100, Math.max(0, (currentTime / safeDuration) * 100)) : 0;
  const isBengali = currentPlaylist.category === 'BENGALI';

  // Calculate seek time from clientX
  const getSecondsFromPointer = useCallback((clientX: number): number => {
    if (!progressBarRef.current) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return ratio * safeDuration;
  }, [safeDuration]);

  // Handle pointer down on progress bar to scrub
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    playKeyClick();
    setIsDraggingScrubber(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    const targetSeconds = getSecondsFromPointer(e.clientX);
    onSeek(targetSeconds);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverSeekPercent(ratio * 100);
    setHoverSeekTime(ratio * safeDuration);

    if (isDraggingScrubber) {
      const targetSeconds = ratio * safeDuration;
      onSeek(targetSeconds);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingScrubber) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
      setIsDraggingScrubber(false);
    }
  };

  const handlePointerLeave = () => {
    if (!isDraggingScrubber) {
      setHoverSeekTime(null);
      setHoverSeekPercent(null);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 pb-2.5 sm:pb-4 pointer-events-auto select-none">
      {/* Luxury Cinematic Glassmorphic Media Player Deck */}
      <div className="relative rounded-2xl sm:rounded-3xl bg-[#080d18]/92 backdrop-blur-2xl border border-white/[0.12] shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.18),0_20px_60px_rgba(0,0,0,0.92)] p-3.5 sm:p-5 transition-all">
        
        {/* Top Channel & Status Row */}
        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mb-2.5 sm:mb-3 px-1 border-b border-white/[0.08] pb-2 sm:pb-2.5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playKeyClick();
                onOpenPlaylists();
              }}
              className={`flex items-center gap-2 px-2.5 py-1 rounded-xl border transition-all duration-200 active:scale-95 group ${
                isBengali
                  ? 'bg-rose-950/35 border-rose-500/40 text-rose-200 hover:bg-rose-950/55 hover:border-rose-400/60 shadow-[inset_0_1px_0_0_rgba(244,63,94,0.2),0_0_12px_rgba(244,63,94,0.15)]'
                  : 'bg-white/[0.04] border-white/10 text-neutral-300 hover:bg-white/[0.08] hover:border-white/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]'
              }`}
              aria-label="Open playlists selector"
            >
              <ListMusic className={`w-3.5 h-3.5 transition-transform group-hover:rotate-6 ${isBengali ? 'text-rose-400' : 'text-neutral-400 group-hover:text-white'}`} />
              <span className="font-semibold tracking-wider truncate max-w-[140px] sm:max-w-[220px]">
                {currentPlaylist.name}
              </span>
              <span className="text-[10px] opacity-75 hidden sm:inline font-normal">
                ({currentPlaylist.category})
              </span>
            </button>
          </div>

          {/* Equalizer Visualizer & Real-time Playback Status */}
          <div className="flex items-center gap-2.5 sm:gap-3 text-neutral-400">
            {/* Dynamic 5-bar Audio Equalizer */}
            <div className="flex items-end gap-0.5 h-3.5 px-2 py-0.5 rounded-md bg-black/40 border border-white/[0.08] shadow-inner">
              <span className={`w-0.5 bg-rose-400 rounded-full transition-all ${isPlaying ? 'animate-eq-1' : 'h-1'}`} />
              <span className={`w-0.5 bg-amber-400 rounded-full transition-all ${isPlaying ? 'animate-eq-2' : 'h-1.5'}`} />
              <span className={`w-0.5 bg-emerald-400 rounded-full transition-all ${isPlaying ? 'animate-eq-3' : 'h-1'}`} />
              <span className={`w-0.5 bg-cyan-400 rounded-full transition-all ${isPlaying ? 'animate-eq-4' : 'h-2'}`} />
              <span className={`w-0.5 bg-sky-400 rounded-full transition-all ${isPlaying ? 'animate-eq-2' : 'h-1'}`} />
            </div>

            <div className="flex items-center gap-1.5">
              {isPlaying && (
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="hidden sm:inline text-[10px] tracking-wider uppercase font-semibold">
                    PLAYING
                  </span>
                </span>
              )}
              {isBuffering && (
                <span className="text-[10px] text-amber-400 tracking-wider font-mono animate-pulse">
                  BUFFERING...
                </span>
              )}
              <span className="text-neutral-300 font-mono text-[11px] font-semibold">
                {formatTime(currentTime)} <span className="text-neutral-500 font-normal">/</span> {formatTime(safeDuration)}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Vinyl Record Turntable + Track Information */}
        <div className="flex items-center gap-3 sm:gap-4 px-1 mb-2.5 sm:mb-3">
          {/* Simulated Spinning Vinyl Disc with Tonearm */}
          <div className="relative flex-shrink-0 flex items-center justify-center">
            <div 
              onClick={() => {
                playKeyClick();
                onTogglePlay();
              }}
              className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-neutral-950 border-2 border-neutral-700 shadow-[0_0_20px_rgba(0,0,0,0.9)] cursor-pointer overflow-hidden flex items-center justify-center group transition-transform active:scale-95"
              title={isPlaying ? 'Click to Pause' : 'Click to Play'}
              aria-label="Vinyl Turntable"
            >
              {/* Concentric Grooves */}
              <div className={`absolute inset-0 rounded-full border border-neutral-800 transition-all ${isPlaying ? 'animate-spin-slow' : ''}`}>
                <div className="absolute inset-1 rounded-full border border-neutral-800" />
                <div className="absolute inset-2.5 rounded-full border border-neutral-800/80" />
                <div className="absolute inset-4 rounded-full border border-neutral-800/60" />
                
                {/* Radial Grooved Light Reflection Shimmer */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/12 via-transparent to-transparent opacity-60 pointer-events-none" />
              </div>

              {/* Center Record Label */}
              <div className={`relative z-10 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-all ${
                isBengali ? 'bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500' : 'bg-gradient-to-tr from-sky-600 via-sky-500 to-indigo-500'
              }`}>
                <div className="w-1.5 h-1.5 rounded-full bg-black shadow-inner" />
              </div>
            </div>

            {/* Stylized Analog Tonearm Needle */}
            <div 
              className={`absolute -top-1 -right-1 w-3.5 h-5 pointer-events-none transition-transform duration-500 origin-top-right ${
                isPlaying ? 'rotate-[20deg]' : 'rotate-[0deg] opacity-75'
              }`}
            >
              <div className="w-1 h-4 bg-gradient-to-b from-neutral-300 to-neutral-500 rounded-sm shadow-sm" />
              <div className="w-1.5 h-1.5 bg-rose-400 rounded-full -mt-0.5 -ml-0.5 shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
            </div>
          </div>

          {/* Track Title and Artist Metadata */}
          <div className="min-w-0 flex-1">
            <h2 className="text-sm sm:text-base md:text-lg font-medium text-neutral-100 truncate tracking-wide">
              {currentTrack?.title || 'Cyber Cafe Transmission'}
            </h2>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-400">
              <span className="truncate font-normal text-rose-300/90 font-bengali">
                {currentTrack?.artist || '2000s Nostalgic Archive'}
              </span>
              <span aria-hidden="true" className="text-neutral-600 hidden sm:inline">·</span>
              <span className="text-neutral-500 font-mono text-[11px] hidden sm:inline">
                {currentPlaylist.name}
              </span>
            </div>
          </div>

          {/* Volume Control Button & Tactile Popover */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => {
                playKeyClick();
                setShowVolumePopup(!showVolumePopup);
              }}
              className="p-2 sm:p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] active:scale-95 border border-white/[0.08] hover:border-white/20 text-neutral-300 hover:text-white transition-all shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]"
              aria-label={isMuted ? 'Unmute volume' : 'Mute volume'}
              title="Volume control"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-neutral-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-neutral-200" />
              )}
            </button>

            {showVolumePopup && (
              <div 
                className="absolute right-0 bottom-full mb-2 p-3.5 rounded-2xl bg-[#090e1a]/95 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.95)] flex flex-col items-center gap-2.5 z-50 w-44 animate-in fade-in zoom-in-95 duration-150"
                onMouseLeave={() => setShowVolumePopup(false)}
              >
                <div className="flex items-center justify-between w-full text-[10px] font-mono text-neutral-400">
                  <span className="flex items-center gap-1 text-rose-300">
                    <SlidersHorizontal className="w-3 h-3" />
                    <span>HI-FI VOLUME</span>
                  </span>
                  <span className="text-neutral-200 font-bold">{isMuted ? '0%' : `${volume}%`}</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => onVolumeChange(Number(e.target.value))}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-400"
                  aria-label="Volume slider"
                />

                {/* Quick Volume Notches */}
                <div className="grid grid-cols-4 gap-1 w-full text-[9px] font-mono">
                  {[25, 50, 75, 100].map((v) => (
                    <button
                      key={v}
                      onClick={() => {
                        playKeyClick();
                        onVolumeChange(v);
                      }}
                      className="py-1 rounded bg-white/[0.04] hover:bg-white/[0.1] text-neutral-400 hover:text-white border border-white/[0.06] transition-colors"
                    >
                      {v}%
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    playKeyClick();
                    onToggleMute();
                  }}
                  className="text-[10px] font-mono text-neutral-400 hover:text-rose-300 underline active:scale-95 transition"
                >
                  {isMuted ? 'RESTORE AUDIO' : 'MUTE (0 dB)'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* High-Precision Interactive Progress Scrubber with Tooltip */}
        <div className="px-1 relative">
          {/* Hover Time Tooltip Bubble */}
          {hoverSeekTime !== null && hoverSeekPercent !== null && (
            <div 
              className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 rounded-md bg-black/90 border border-white/20 text-rose-300 font-mono text-[10px] font-bold shadow-lg pointer-events-none z-30 animate-fade-in"
              style={{ left: `${Math.min(95, Math.max(5, hoverSeekPercent))}%` }}
            >
              {formatTime(hoverSeekTime)}
            </div>
          )}

          <div 
            ref={progressBarRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerLeave}
            className="relative w-full h-2.5 sm:h-3 bg-neutral-800/80 hover:bg-neutral-800/95 rounded-full cursor-pointer group transition-all"
            role="progressbar"
            aria-valuenow={currentTime}
            aria-valuemin={0}
            aria-valuemax={safeDuration}
            aria-label="Seek progress bar"
          >
            {/* Hover preview marker */}
            {hoverSeekPercent !== null && (
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-white/40 pointer-events-none"
                style={{ left: `${hoverSeekPercent}%` }}
              />
            )}

            {/* Filled progress track with atmospheric gradient */}
            <div 
              className={`h-full rounded-full relative transition-all duration-75 ${
                isBengali
                  ? 'bg-gradient-to-r from-rose-500 via-amber-400 to-rose-300 shadow-[0_0_14px_rgba(244,63,94,0.4)]'
                  : 'bg-gradient-to-r from-sky-500 via-neutral-100 to-emerald-300 shadow-[0_0_14px_rgba(56,189,248,0.4)]'
              }`}
              style={{ width: `${progressPercent}%` }}
            >
              {/* Glowing scrubber thumb head */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.95)] opacity-80 group-hover:opacity-100 group-hover:scale-125 transition-all" />
            </div>
          </div>
        </div>

        {/* Playback Controls Row */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mt-2.5 sm:mt-3">
          {/* Previous Track */}
          <button
            onClick={() => {
              playKeyClick();
              onPrev();
            }}
            className="p-2 sm:p-2.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/[0.08] active:scale-90 transition-all duration-150"
            aria-label="Previous track"
            title="Previous track"
          >
            <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Rewind 10s */}
          <button
            onClick={() => {
              playKeyClick();
              onRewind();
            }}
            className="p-2 sm:p-2.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/[0.08] active:scale-90 transition-all duration-150"
            aria-label="Rewind 10 seconds"
            title="Rewind 10s"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Prominent Play / Pause Button with Ambient Radial Bloom */}
          <button
            onClick={() => {
              playKeyClick();
              onTogglePlay();
            }}
            disabled={isBuffering}
            className={`p-3.5 sm:p-4 rounded-full text-neutral-950 transition-all duration-200 active:scale-95 disabled:opacity-50 ${
              isBengali
                ? 'bg-gradient-to-tr from-rose-400 via-rose-200 to-white hover:scale-105 shadow-[0_0_35px_rgba(244,63,94,0.45)] hover:shadow-[0_0_45px_rgba(244,63,94,0.6)]'
                : 'bg-white hover:bg-neutral-100 hover:scale-105 shadow-[0_0_35px_rgba(255,255,255,0.35)] hover:shadow-[0_0_45px_rgba(255,255,255,0.5)]'
            }`}
            aria-label={isPlaying ? 'Pause music' : 'Play music'}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-neutral-950" />
            ) : (
              <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-neutral-950 translate-x-0.5" />
            )}
          </button>

          {/* Fast Forward 10s */}
          <button
            onClick={() => {
              playKeyClick();
              onForward();
            }}
            className="p-2 sm:p-2.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/[0.08] active:scale-90 transition-all duration-150"
            aria-label="Forward 10 seconds"
            title="Forward 10s"
          >
            <RotateCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Next Track */}
          <button
            onClick={() => {
              playKeyClick();
              onNext();
            }}
            className="p-2 sm:p-2.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/[0.08] active:scale-90 transition-all duration-150"
            aria-label="Next track"
            title="Next track"
          >
            <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
