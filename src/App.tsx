/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { HeroCenter } from './components/HeroCenter';
import { MainMusicPlayer } from './components/MainMusicPlayer';
import { PlaylistSelectorModal } from './components/PlaylistSelectorModal';
import { MoreMusicPanel } from './components/MoreMusicPanel';
import { MusicSearchModal } from './components/MusicSearchModal';
import { OfflineModal } from './components/OfflineModal';
import { LicenseModal } from './components/LicenseModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { BackgroundLayer } from './components/BackgroundLayer';
import { BackgroundSettingsModal } from './components/BackgroundSettingsModal';
import { FloatingLyricsOverlay } from './components/FloatingLyricsOverlay';
import { LyricTimingEditorModal } from './components/LyricTimingEditorModal';

import { PLAYLISTS } from './data/playlists';
import { BACKGROUND_PRESETS } from './data/backgroundPresets';
import { Playlist, RoyaltyFreeTrack, BackgroundPresetId } from './types';
import { useYouTubeAudio } from './hooks/useYouTubeAudio';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { usePWA } from './hooks/usePWA';
import { toggleCyberCafeAmbience, playKeyClick } from './utils/cyberCafeAmbience';

export default function App() {
  const isOnline = useOnlineStatus();
  const { isInstallable, isStandalone, isIOS, installApp, newVersionAvailable, updateApp } = usePWA();

  // Active playlist and ambient features
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist>(() => {
    try {
      const saved = localStorage.getItem('aiearnx_playlist_id');
      const match = PLAYLISTS.find((p) => p.id === saved);
      if (match) return match;
    } catch {}
    // Default to the requested Bengali playlist
    const bengali = PLAYLISTS.find((p) => p.id === 'best-of-20s-bengali');
    return bengali || PLAYLISTS[0];
  });
  const [isAmbienceActive, setIsAmbienceActive] = useState(false);
  const [isCrtEnabled, setIsCrtEnabled] = useState(true);
  const [isLyricsTouchEnabled, setIsLyricsTouchEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('aiearnx_lyrics_touch');
      if (saved !== null) return saved === 'true';
    } catch {}
    return true;
  });

  const handleToggleLyricsTouch = () => {
    setIsLyricsTouchEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('aiearnx_lyrics_touch', String(next));
      } catch {}
      return next;
    });
  };

  // Background Settings State (defaults to the uploaded Street Chai & Red Salon Chair scene)
  const [bgType, setBgType] = useState<BackgroundPresetId>(() => {
    try {
      return (localStorage.getItem('aiearnx_bg_type') as BackgroundPresetId) || 'street';
    } catch {
      return 'street';
    }
  });

  const [customBgDataUrl, setCustomBgDataUrl] = useState<string | null>(() => {
    try {
      return localStorage.getItem('aiearnx_custom_bg');
    } catch {
      return null;
    }
  });

  const [dimming, setDimming] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('aiearnx_bg_dimming');
      return saved ? Number(saved) : 38;
    } catch {
      return 38;
    }
  });

  const [blur, setBlur] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('aiearnx_bg_blur');
      return saved ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });

  const activePresetObj = BACKGROUND_PRESETS.find((p) => p.id === bgType);

  // Modals state
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [isMoreMusicOpen, setIsMoreMusicOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
  const [isBackgroundModalOpen, setIsBackgroundModalOpen] = useState(false);
  const [isLyricEditorOpen, setIsLyricEditorOpen] = useState(false);
  const [licenseModalTrack, setLicenseModalTrack] = useState<RoyaltyFreeTrack | null>(null);

  // Core YouTube Audio hook
  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    currentTrack,
    currentTrackIndex,
    isBuffering,
    togglePlay,
    handleNext,
    handlePrev,
    handleRewind,
    handleForward,
    seekTo,
    handleVolumeChange,
    toggleMute,
    setCurrentTrackIndex,
  } = useYouTubeAudio({ currentPlaylist, isOnline });

  // Toggle cyber cafe ambience sound
  const handleToggleAmbience = useCallback(() => {
    const newState = toggleCyberCafeAmbience();
    setIsAmbienceActive(newState);
  }, []);

  // Background handlers
  const handleSelectBgType = (type: BackgroundPresetId) => {
    setBgType(type);
    try {
      localStorage.setItem('aiearnx_bg_type', type);
    } catch {
      // ignore
    }
  };

  const handleUploadCustomBg = (dataUrl: string) => {
    setCustomBgDataUrl(dataUrl);
    setBgType('custom');
    try {
      localStorage.setItem('aiearnx_custom_bg', dataUrl);
      localStorage.setItem('aiearnx_bg_type', 'custom');
    } catch {
      // ignore
    }
  };

  const handleDimmingChange = (val: number) => {
    setDimming(val);
    try {
      localStorage.setItem('aiearnx_bg_dimming', String(val));
    } catch {
      // ignore
    }
  };

  const handleBlurChange = (val: number) => {
    setBlur(val);
    try {
      localStorage.setItem('aiearnx_bg_blur', String(val));
    } catch {
      // ignore
    }
  };

  const handleResetDefaults = () => {
    setBgType('street');
    setDimming(38);
    setBlur(0);
    try {
      localStorage.setItem('aiearnx_bg_type', 'street');
      localStorage.setItem('aiearnx_bg_dimming', '38');
      localStorage.setItem('aiearnx_bg_blur', '0');
    } catch {
      // ignore
    }
  };

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing inside search inputs
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        playKeyClick();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        playKeyClick();
        handleForward();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        playKeyClick();
        handleRewind();
      } else if (e.key === 'm' || e.key === 'M') {
        playKeyClick();
        toggleMute();
      } else if (e.key === 'b' || e.key === 'B') {
        if (!isBackgroundModalOpen && !isSearchModalOpen && !isMoreMusicOpen && !isPlaylistModalOpen) {
          playKeyClick();
          setIsBackgroundModalOpen(true);
        }
      } else if (e.key === 's' || e.key === 'S') {
        if (!isSearchModalOpen && !isMoreMusicOpen && !isPlaylistModalOpen && !isBackgroundModalOpen) {
          playKeyClick();
          setIsSearchModalOpen(true);
        }
      } else if (e.key === 'p' || e.key === 'P') {
        playKeyClick();
        setIsPlaylistModalOpen((prev) => !prev);
      } else if (e.key === 'l' || e.key === 'L') {
        playKeyClick();
        setIsLyricEditorOpen((prev) => !prev);
      } else if (e.key === 'c' || e.key === 'C') {
        playKeyClick();
        setIsCrtEnabled((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsPlaylistModalOpen(false);
        setIsMoreMusicOpen(false);
        setIsSearchModalOpen(false);
        setIsOfflineModalOpen(false);
        setIsBackgroundModalOpen(false);
        setIsLyricEditorOpen(false);
        setLicenseModalTrack(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, handleForward, handleRewind, toggleMute, isSearchModalOpen, isMoreMusicOpen, isPlaylistModalOpen, isBackgroundModalOpen]);

  // Playlist selection handler
  const handleSelectPlaylist = (newPl: Playlist) => {
    setCurrentPlaylist(newPl);
    setCurrentTrackIndex(0);
    try {
      localStorage.setItem('aiearnx_playlist_id', newPl.id);
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#07090e] text-neutral-200 select-none flex flex-col justify-between">
      {/* Off-screen hidden YouTube IFrame audio element (Never visible to user, no red logo, no thumbnails) */}
      <div 
        id="aiearnx-hidden-yt-iframe" 
        className="fixed -top-[9999px] -left-[9999px] w-px h-px opacity-0 pointer-events-none"
        aria-hidden="true" 
      />

      {/* Cinematic Dynamic Background Layer (Street Chai & Red Salon Chair / Custom / Cyber) */}
      <BackgroundLayer
        bgType={bgType}
        customBgDataUrl={customBgDataUrl}
        dimming={dimming}
        blur={blur}
        isCrtEnabled={isCrtEnabled}
      />

      {/* Semantic Top Header */}
      <Header
        isOnline={isOnline}
        onOpenOfflineModal={() => setIsOfflineModalOpen(true)}
        onOpenSearchModal={() => setIsSearchModalOpen(true)}
        onOpenMoreMusic={() => setIsMoreMusicOpen(true)}
        onOpenBackgroundModal={() => setIsBackgroundModalOpen(true)}
        onOpenPlaylistModal={() => setIsPlaylistModalOpen(true)}
        onOpenLyricTimingEditor={() => setIsLyricEditorOpen(true)}
        currentPresetBadge={activePresetObj?.badge}
        isAmbienceActive={isAmbienceActive}
        onToggleAmbience={handleToggleAmbience}
        isCrtEnabled={isCrtEnabled}
        onToggleCrt={() => setIsCrtEnabled(!isCrtEnabled)}
        isInstallable={isInstallable}
        onInstallApp={installApp}
        isLyricsTouchEnabled={isLyricsTouchEnabled}
        onToggleLyricsTouch={handleToggleLyricsTouch}
      />

      {/* Main Viewport Content - Viewport-locked 100dvh, No scrolling */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-between pt-16 pb-2 w-full max-w-7xl mx-auto overflow-hidden">
        {/* Central Cinematic Branding with Live Song Lyrics under 'মনের কথা' */}
        <HeroCenter
          currentPlaylistName={currentPlaylist.name}
          onOpenPlaylists={() => setIsPlaylistModalOpen(true)}
          isPlaying={isPlaying}
          onTogglePlay={togglePlay}
          currentTrack={currentTrack}
          currentTime={currentTime}
          onOpenLyricTimingEditor={() => setIsLyricEditorOpen(true)}
        />

        {/* Large Premium Music Player Bar */}
        <nav aria-label="Music Player Controls" className="w-full">
          <MainMusicPlayer
            currentPlaylist={currentPlaylist}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            isBuffering={isBuffering}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            isMuted={isMuted}
            onTogglePlay={togglePlay}
            onPrev={handlePrev}
            onNext={handleNext}
            onRewind={handleRewind}
            onForward={handleForward}
            onSeek={seekTo}
            onVolumeChange={handleVolumeChange}
            onToggleMute={toggleMute}
            onOpenPlaylists={() => setIsPlaylistModalOpen(true)}
          />
        </nav>
      </main>

      {/* Semantic Footer Information (Subtle, single line, no scrolling) */}
      <footer className="relative z-10 px-4 sm:px-8 py-2 border-t border-white/[0.06] backdrop-blur-xl bg-[#060912]/65 text-[10px] font-mono text-neutral-400 flex items-center justify-between pointer-events-auto shadow-[0_-4px_25px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-neutral-100 font-bengali tracking-tight drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)] text-[11px] sm:text-xs">
              মনের কথা
            </span>
            <span className="font-mono font-medium tracking-[0.2em] text-[10px] text-neutral-400/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              ARCHIVE
            </span>
          </div>
          <span className="hidden sm:inline text-neutral-600">•</span>
          <span className="hidden sm:inline text-neutral-400">
            {activePresetObj ? activePresetObj.name.toUpperCase() : 'CUSTOM WALLPAPER'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => {
              playKeyClick();
              setIsPlaylistModalOpen(true);
            }}
            className="hover:text-white transition-all active:scale-95 px-2 py-0.5 rounded-md hover:bg-white/[0.04] text-rose-300 font-semibold flex items-center gap-1"
            aria-label="Open playlist selector"
            title="Change active playlist"
          >
            <span>CHANNEL: {currentPlaylist.name.toUpperCase()}</span>
          </button>
          <span className="text-neutral-600">•</span>
          <button
            onClick={() => {
              playKeyClick();
              setIsBackgroundModalOpen(true);
            }}
            className="hover:text-white transition-all active:scale-95 px-2 py-0.5 rounded-md hover:bg-white/[0.04] text-sky-400 font-semibold flex items-center gap-1"
            aria-label="Open cyber-cafe wallpaper presets"
          >
            <span>PRESETS: {activePresetObj ? activePresetObj.badge : 'CUSTOM'}</span>
          </button>
          <span className="text-neutral-600 hidden xs:inline">•</span>
          <button
            onClick={() => {
              playKeyClick();
              setIsOfflineModalOpen(true);
            }}
            className="hover:text-neutral-200 transition-all active:scale-95 px-2 py-0.5 rounded-md hover:bg-white/[0.04] text-neutral-400 hidden xs:inline"
          >
            {isOnline ? 'ONLINE' : 'OFFLINE MODE'}
          </button>
          <span className="text-neutral-600 hidden sm:inline">•</span>
          <button
            onClick={() => {
              playKeyClick();
              setIsMoreMusicOpen(true);
            }}
            className="hover:text-neutral-200 transition-all active:scale-95 px-2 py-0.5 rounded-md hover:bg-white/[0.04] text-neutral-400 hidden sm:inline"
          >
            MORE MUSIC
          </button>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      <BackgroundSettingsModal
        isOpen={isBackgroundModalOpen}
        onClose={() => setIsBackgroundModalOpen(false)}
        currentBgType={bgType}
        onSelectBgType={handleSelectBgType}
        customBgDataUrl={customBgDataUrl}
        onUploadCustomBg={handleUploadCustomBg}
        dimming={dimming}
        onDimmingChange={handleDimmingChange}
        blur={blur}
        onBlurChange={handleBlurChange}
        onResetDefaults={handleResetDefaults}
      />

      <PlaylistSelectorModal
        isOpen={isPlaylistModalOpen}
        onClose={() => setIsPlaylistModalOpen(false)}
        currentPlaylist={currentPlaylist}
        currentTrackIndex={currentTrackIndex}
        onSelectPlaylist={handleSelectPlaylist}
        onSelectTrack={(idx) => {
          setCurrentTrackIndex(idx);
          seekTo(0);
        }}
      />

      <MoreMusicPanel
        isOpen={isMoreMusicOpen}
        onClose={() => setIsMoreMusicOpen(false)}
        onOpenSearch={() => setIsSearchModalOpen(true)}
      />

      <MusicSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        isOnline={isOnline}
        onOpenLicense={(track) => setLicenseModalTrack(track)}
      />

      <OfflineModal
        isOpen={isOfflineModalOpen}
        onClose={() => setIsOfflineModalOpen(false)}
        isOnline={isOnline}
      />

      <LicenseModal
        isOpen={!!licenseModalTrack}
        onClose={() => setLicenseModalTrack(null)}
        track={licenseModalTrack}
      />

      <LyricTimingEditorModal
        isOpen={isLyricEditorOpen}
        onClose={() => setIsLyricEditorOpen(false)}
        currentTrack={currentTrack}
        currentTime={currentTime}
        duration={duration}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        onSeek={seekTo}
      />

      <PWAInstallBanner
        isInstallable={isInstallable}
        isStandalone={isStandalone}
        isIOS={isIOS}
        onInstall={installApp}
        newVersionAvailable={newVersionAvailable}
        onUpdate={updateApp}
      />

      {/* Floating Animated Bengali Lyrics Synced to Audio Playback & Touch */}
      <FloatingLyricsOverlay
        isEnabled={isLyricsTouchEnabled}
        currentTrack={currentTrack}
        currentTime={currentTime}
        isPlaying={isPlaying}
      />
    </div>
  );
}
