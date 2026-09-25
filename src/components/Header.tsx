import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Wifi, 
  WifiOff, 
  Volume2, 
  VolumeX, 
  Tv, 
  Sparkles, 
  Download, 
  Image as ImageIcon, 
  ListMusic, 
  Music, 
  Clock 
} from 'lucide-react';
import { playKeyClick } from '../utils/cyberCafeAmbience';

interface HeaderProps {
  isOnline: boolean;
  onOpenOfflineModal: () => void;
  onOpenSearchModal: () => void;
  onOpenMoreMusic: () => void;
  onOpenBackgroundModal: () => void;
  onOpenPlaylistModal: () => void;
  onOpenLyricTimingEditor?: () => void;
  currentPresetBadge?: string;
  isAmbienceActive: boolean;
  onToggleAmbience: () => void;
  isCrtEnabled: boolean;
  onToggleCrt: () => void;
  isInstallable: boolean;
  onInstallApp: () => void;
  isLyricsTouchEnabled?: boolean;
  onToggleLyricsTouch?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isOnline,
  onOpenOfflineModal,
  onOpenSearchModal,
  onOpenMoreMusic,
  onOpenBackgroundModal,
  onOpenPlaylistModal,
  onOpenLyricTimingEditor,
  currentPresetBadge,
  isAmbienceActive,
  onToggleAmbience,
  isCrtEnabled,
  onToggleCrt,
  isInstallable,
  onInstallApp,
  isLyricsTouchEnabled = true,
  onToggleLyricsTouch,
}) => {
  // 2000s Cyber Cafe Digital Clock
  const [cyberClock, setCyberClock] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCyberClock(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between pointer-events-auto backdrop-blur-2xl bg-[#060912]/80 border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.7)] select-none">
      {/* Brand & Nostalgic Cyber Cafe Status */}
      <div className="flex items-center gap-2 sm:gap-3.5">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bengali text-lg sm:text-xl font-bold bg-gradient-to-r from-white via-neutral-100 to-neutral-300 bg-clip-text text-transparent drop-shadow-sm tracking-wide">
              মনের কথা
            </span>
            <div className="hidden xs:flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono tracking-wider bg-white/[0.04] text-neutral-300 border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>CABIN 04</span>
              <span className="text-neutral-500">|</span>
              <span className="text-rose-300 font-semibold">{cyberClock || '₹20/HR'}</span>
            </div>
          </div>
          <span className="text-[9px] sm:text-[10px] font-mono text-neutral-400 tracking-widest hidden md:inline-block">
            EST. 2004 • MONER KOTHA ARCHIVE
          </span>
        </div>
      </div>

      {/* Action Controls Group */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* Background Wallpaper Presets */}
        <button
          onClick={() => {
            playKeyClick();
            onOpenBackgroundModal();
          }}
          className="px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-mono transition-all duration-200 flex items-center gap-1.5 bg-white/[0.04] hover:bg-white/[0.09] active:scale-[0.97] border border-white/[0.08] hover:border-sky-400/40 text-neutral-300 hover:text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
          aria-label="Change cyber cafe background presets"
          title="Change Cyber Cafe Preset Wallpaper (B)"
        >
          <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline text-[11px] tracking-wider font-medium">
            {currentPresetBadge ? currentPresetBadge : 'PRESETS'}
          </span>
        </button>

        {/* Playlists Button */}
        <button
          onClick={() => {
            playKeyClick();
            onOpenPlaylistModal();
          }}
          className="px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-mono transition-all duration-200 flex items-center gap-1.5 bg-rose-950/35 hover:bg-rose-950/60 active:scale-[0.97] border border-rose-500/35 hover:border-rose-400/60 text-rose-200 hover:text-white shadow-[inset_0_1px_0_0_rgba(244,63,94,0.2),0_0_12px_rgba(244,63,94,0.15)]"
          aria-label="Open playlist selector"
          title="Open Bangla & Nostalgia Playlists (P)"
        >
          <ListMusic className="w-3.5 h-3.5 text-rose-400" />
          <span className="text-[11px] tracking-wider font-semibold hidden xs:inline">PLAYLISTS</span>
        </button>

        {/* Ambient Settings Group (Ambience, CRT, Touch Lyrics) */}
        <div className="flex items-center bg-black/40 rounded-xl border border-white/[0.08] p-0.5">
          {/* Cyber Cafe Ambience (Hum & fan sound) */}
          <button
            onClick={() => {
              playKeyClick();
              onToggleAmbience();
            }}
            className={`p-1.5 sm:px-2 sm:py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1 ${
              isAmbienceActive
                ? 'bg-cyan-950/70 text-cyan-200 border border-cyan-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
            aria-label="Toggle cyber cafe ambience sound"
            title="Cyber Cafe CRT & Fan Ambience"
          >
            {isAmbienceActive ? <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden md:inline text-[10px]">FAN</span>
          </button>

          {/* CRT Scanline Toggle */}
          <button
            onClick={() => {
              playKeyClick();
              onToggleCrt();
            }}
            className={`p-1.5 sm:px-2 sm:py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1 ${
              isCrtEnabled
                ? 'bg-neutral-800 text-neutral-100 border border-white/20 shadow-sm'
                : 'text-neutral-500 hover:text-white'
            }`}
            aria-label="Toggle CRT scanline monitor effect"
            title="Toggle CRT Screen Scanlines"
          >
            <Tv className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[10px]">CRT</span>
          </button>

          {/* Touch Lyrics Wave Toggle ("লিরিক্স") */}
          {onToggleLyricsTouch && (
            <button
              onClick={() => {
                playKeyClick();
                onToggleLyricsTouch();
              }}
              className={`p-1.5 sm:px-2 sm:py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1 ${
                isLyricsTouchEnabled
                  ? 'bg-rose-950/70 text-rose-200 border border-rose-500/40 shadow-sm'
                  : 'text-neutral-500 hover:text-white'
              }`}
              aria-label="Toggle floating lyrics on click/touch"
              title="Toggle Floating Bengali Lyrics on Screen Touch"
            >
              <Music className={`w-3.5 h-3.5 ${isLyricsTouchEnabled ? 'text-rose-400 animate-note-twinkle' : 'text-neutral-500'}`} />
              <span className="hidden md:inline text-[10px] font-bengali font-bold">লিরিক্স</span>
            </button>
          )}
        </div>

        {/* Sync Lyric Timing Studio Button */}
        {onOpenLyricTimingEditor && (
          <button
            onClick={() => {
              playKeyClick();
              onOpenLyricTimingEditor();
            }}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-mono transition-all duration-200 flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 active:scale-[0.97] border border-rose-500/30 hover:border-rose-400/50 text-rose-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
            aria-label="Open lyric timing editor"
            title="Lyric Timing Studio Dashboard (L)"
          >
            <Clock className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline text-[11px] font-semibold tracking-wider">SYNC LYRICS</span>
          </button>
        )}

        {/* Search Music Button */}
        <button
          onClick={() => {
            playKeyClick();
            onOpenSearchModal();
          }}
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-mono transition-all duration-200 flex items-center gap-1.5 bg-white/[0.04] hover:bg-white/[0.09] active:scale-[0.97] border border-white/[0.08] hover:border-white/20 text-neutral-200 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]"
          aria-label="Search music"
          title="Search Royalty-Free Music"
        >
          <Search className="w-3.5 h-3.5 text-neutral-300" />
          <span className="hidden lg:inline text-[11px] tracking-wider">SEARCH</span>
        </button>

        {/* More Music Button */}
        <button
          onClick={() => {
            playKeyClick();
            onOpenMoreMusic();
          }}
          className="px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-mono tracking-wider transition-all duration-200 flex items-center gap-1.5 bg-white/[0.06] hover:bg-white/[0.12] active:scale-[0.97] border border-white/15 hover:border-sky-400/40 text-neutral-100 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_0_12px_rgba(255,255,255,0.05)] hover:shadow-[0_0_18px_rgba(56,189,248,0.2)]"
          aria-label="More music"
          title="More Music Options"
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-300" />
          <span className="text-[11px] font-medium hidden xs:inline">MORE</span>
        </button>

        {/* Online / Offline Status Button */}
        <button
          onClick={() => {
            playKeyClick();
            onOpenOfflineModal();
          }}
          className="p-1.5 sm:px-2 sm:py-1.5 rounded-xl text-xs font-mono transition-all duration-200 flex items-center gap-1.5 bg-white/[0.03] hover:bg-white/[0.08] active:scale-[0.97] border border-white/[0.08] hover:border-white/20 text-neutral-300"
          aria-label="Offline mode status"
          title="Check Offline & Cache Status"
        >
          {isOnline ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] text-emerald-400 tracking-wider hidden lg:inline">ONLINE</span>
            </>
          ) : (
            <>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] text-amber-400 tracking-wider hidden lg:inline">OFFLINE</span>
            </>
          )}
        </button>

        {/* Install PWA Button (if available) */}
        {isInstallable && (
          <button
            onClick={() => {
              playKeyClick();
              onInstallApp();
            }}
            className="p-1.5 sm:px-2 sm:py-1.5 rounded-xl text-xs font-mono transition-all duration-200 flex items-center gap-1 bg-white/[0.06] hover:bg-white/[0.12] active:scale-[0.97] border border-white/15 text-neutral-200"
            aria-label="Install মনের কথা application"
            title="Install App"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden xl:inline text-[10px]">INSTALL</span>
          </button>
        )}
      </div>
    </header>
  );
};
