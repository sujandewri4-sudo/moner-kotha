import React, { useEffect, useState } from 'react';
import { X, Disc, Music, Check, ExternalLink } from 'lucide-react';
import { Playlist, PlaylistTrack, MusicCategory } from '../types';
import { PLAYLISTS } from '../data/playlists';
import { playKeyClick } from '../utils/cyberCafeAmbience';

interface PlaylistSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlaylist: Playlist;
  currentTrackIndex: number;
  onSelectPlaylist: (playlist: Playlist) => void;
  onSelectTrack: (trackIndex: number) => void;
}

export const PlaylistSelectorModal: React.FC<PlaylistSelectorModalProps> = ({
  isOpen,
  onClose,
  currentPlaylist,
  currentTrackIndex,
  onSelectPlaylist,
  onSelectTrack,
}) => {
  const [activeTab, setActiveTab] = useState<MusicCategory | 'ALL'>(currentPlaylist.category);

  useEffect(() => {
    setActiveTab(currentPlaylist.category);
  }, [currentPlaylist]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredPlaylists = activeTab === 'ALL' 
    ? PLAYLISTS 
    : PLAYLISTS.filter((p) => p.category === activeTab);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-2xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl max-h-[85vh] rounded-3xl bg-[#080d18]/92 backdrop-blur-2xl border border-white/[0.12] shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15),0_25px_65px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden text-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <Disc className="w-4 h-4 text-rose-400 animate-spin-slow" />
            <h3 className="font-['Cinzel',serif] tracking-widest text-sm sm:text-base font-semibold bg-gradient-to-r from-white via-neutral-100 to-neutral-300 bg-clip-text text-transparent">
              PLAYLISTS &amp; CHANNELS
            </h3>
          </div>
          <button
            onClick={() => {
              playKeyClick();
              onClose();
            }}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 active:scale-95 transition border border-transparent hover:border-white/10"
            aria-label="Close playlists selector"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Tabs: Tactile glass tabs */}
        <div className="flex border-b border-white/[0.08] bg-black/35 px-4 sm:px-6 pt-2.5 gap-2 sm:gap-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              playKeyClick();
              setActiveTab('BENGALI');
            }}
            className={`pb-3 px-3 text-xs font-mono tracking-wider sm:tracking-widest whitespace-nowrap transition-all duration-200 relative rounded-t-lg hover:bg-white/[0.04] ${
              activeTab === 'BENGALI'
                ? 'text-rose-300 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            BENGALI
            {activeTab === 'BENGALI' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.7)]" />
            )}
          </button>
          <button
            onClick={() => {
              playKeyClick();
              setActiveTab('FEATURED');
            }}
            className={`pb-3 px-3 text-xs font-mono tracking-wider sm:tracking-widest whitespace-nowrap transition-all duration-200 relative rounded-t-lg hover:bg-white/[0.04] ${
              activeTab === 'FEATURED'
                ? 'text-neutral-100 font-semibold'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            2000s &amp; NOSTALGIA
            {activeTab === 'FEATURED' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-200 shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
            )}
          </button>
          <button
            onClick={() => {
              playKeyClick();
              setActiveTab('PUNJABI');
            }}
            className={`pb-3 px-3 text-xs font-mono tracking-wider sm:tracking-widest whitespace-nowrap transition-all duration-200 relative rounded-t-lg hover:bg-white/[0.04] ${
              activeTab === 'PUNJABI'
                ? 'text-neutral-100 font-semibold'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            PUNJABI CATEGORY
            {activeTab === 'PUNJABI' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-200 shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
            )}
          </button>
          <button
            onClick={() => {
              playKeyClick();
              setActiveTab('ALL');
            }}
            className={`pb-3 px-3 text-xs font-mono tracking-wider sm:tracking-widest whitespace-nowrap transition-all duration-200 relative rounded-t-lg hover:bg-white/[0.04] ${
              activeTab === 'ALL'
                ? 'text-neutral-100 font-semibold'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            ALL CHANNELS ({PLAYLISTS.length})
            {activeTab === 'ALL' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
            )}
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Playlist selector tiles (Pure text/icon based, NO thumbnails) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredPlaylists.map((pl) => {
              const isSelected = pl.id === currentPlaylist.id;
              const isBengali = pl.category === 'BENGALI';
              return (
                <button
                  key={pl.id}
                  onClick={() => {
                    playKeyClick();
                    onSelectPlaylist(pl);
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between active:scale-[0.985] ${
                    isSelected
                      ? isBengali
                        ? 'bg-rose-950/25 border-rose-500/50 shadow-[inset_0_1px_0_0_rgba(244,63,94,0.3),0_0_24px_rgba(244,63,94,0.2)]'
                        : 'bg-white/[0.08] border-white/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_0_24px_rgba(255,255,255,0.08)]'
                      : isBengali
                      ? 'bg-rose-950/10 border-rose-800/30 hover:bg-rose-950/20 hover:border-rose-600/50 shadow-[inset_0_1px_0_0_rgba(244,63,94,0.08)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
                      : 'bg-white/[0.025] border-white/[0.07] hover:bg-white/[0.06] hover:border-white/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
                  }`}
                  aria-label={`Select playlist ${pl.name}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`font-['Cinzel',serif] tracking-wider text-sm font-semibold ${isBengali ? 'text-rose-200' : 'text-neutral-100'}`}>
                      {pl.name}
                    </span>
                    {isSelected ? (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-300 bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                        <Check className="w-3.5 h-3.5" />
                        <span>ACTIVE</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-neutral-400">
                        {pl.tracks.length} TRACKS
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-neutral-400 mt-1.5 line-clamp-1 font-mono">
                    {pl.subtitle}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Playlist Tracks List */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-mono uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-neutral-400" />
                <span>{currentPlaylist.name} — TRACKS ({currentPlaylist.tracks.length})</span>
              </h4>
              
              <a
                href={currentPlaylist.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playKeyClick()}
                className="text-[10px] font-mono text-sky-400 hover:text-sky-300 flex items-center gap-1 transition px-2 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-sky-400/40 active:scale-95"
                title="View original YouTube playlist"
              >
                <span>YOUTUBE PLAYLIST</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="space-y-1">
              {currentPlaylist.tracks.map((track: PlaylistTrack, idx: number) => {
                const isCurrent = idx === currentTrackIndex;
                return (
                  <button
                    key={track.id}
                    onClick={() => {
                      playKeyClick();
                      onSelectTrack(idx);
                      onClose();
                    }}
                    className={`w-full px-3 py-2.5 rounded-xl text-left flex items-center justify-between text-xs transition duration-150 active:scale-[0.99] ${
                      isCurrent
                        ? 'bg-white/10 text-white font-medium border border-white/15 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_2px_8px_rgba(0,0,0,0.3)]'
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.05] border border-transparent hover:border-white/[0.08]'
                    }`}
                    aria-label={`Play ${track.title} by ${track.artist}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-[10px] text-neutral-400 w-5">
                        {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                      </span>
                      <div className="truncate">
                        <p className={`truncate font-medium ${isCurrent ? 'text-white' : 'text-neutral-200'}`}>{track.title}</p>
                        <p className="text-[10px] text-neutral-400 truncate">{track.artist}</p>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-neutral-400 ml-2">
                      {track.duration}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="px-6 py-3 border-t border-white/[0.08] bg-black/40 text-[10px] font-mono text-neutral-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-neutral-200 font-bengali tracking-tight drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)]">মনের কথা</span>
            <span className="tracking-[0.18em] text-[10px] text-neutral-400/90 font-medium">NOSTALGIA ARCHIVE</span>
          </div>
          <span className="text-neutral-400">YOUTUBE API AUDIO FEED</span>
        </div>
      </div>
    </div>
  );
};
