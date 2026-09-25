import React, { useEffect } from 'react';
import { X, Search, ExternalLink, Music2, Youtube, Sparkles } from 'lucide-react';
import { playKeyClick } from '../utils/cyberCafeAmbience';

interface MoreMusicPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
}

export const MoreMusicPanel: React.FC<MoreMusicPanelProps> = ({
  isOpen,
  onClose,
  onOpenSearch,
}) => {
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

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end items-end sm:items-stretch bg-black/65 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Slide-over panel (Right on desktop, bottom sheet on mobile) */}
      <div 
        className="w-full sm:max-w-md h-auto sm:h-full bg-[#080d18]/94 backdrop-blur-2xl border-t sm:border-t-0 sm:border-l border-white/[0.12] shadow-[-25px_0_70px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden text-neutral-200 rounded-t-3xl sm:rounded-none animate-in slide-in-from-bottom sm:slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <h3 className="font-['Cinzel',serif] tracking-widest text-sm font-semibold bg-gradient-to-r from-white via-neutral-100 to-neutral-300 bg-clip-text text-transparent">
              MORE MUSIC
            </h3>
          </div>
          <button
            onClick={() => {
              playKeyClick();
              onClose();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono text-neutral-400 hover:text-white hover:bg-white/10 active:scale-95 transition border border-transparent hover:border-white/10"
            aria-label="Close more music panel"
          >
            <X className="w-3.5 h-3.5" />
            <span>CLOSE</span>
          </button>
        </div>

        {/* Content Options */}
        <div className="p-6 space-y-3.5 flex-1 overflow-y-auto">
          <p className="text-xs text-neutral-400 leading-relaxed font-mono">
            Explore extended audio destinations and legitimate royalty-free archives.
          </p>

          {/* Option 1: Search Music (Royalty Free) */}
          <button
            onClick={() => {
              playKeyClick();
              onClose();
              onOpenSearch();
            }}
            className="w-full p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] active:scale-[0.985] border border-white/[0.08] hover:border-sky-400/40 transition-all duration-200 flex items-center justify-between text-left group shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] hover:shadow-[0_4px_20px_rgba(56,189,248,0.15)]"
            aria-label="Open royalty free music search"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-sky-950/40 text-sky-400 border border-sky-800/40 group-hover:scale-105 transition-transform">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-neutral-100 tracking-wide group-hover:text-sky-300 transition-colors">
                  SEARCH MUSIC
                </h4>
                <p className="text-xs text-neutral-400 mt-0.5 font-mono text-[11px]">
                  Browse verified royalty-free & CC0 audio archives
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-neutral-500 group-hover:text-neutral-300 group-hover:translate-x-0.5 transition-all">→</span>
          </button>

          {/* Option 2: Best of 20s Bengali songs Playlist Link */}
          <a
            href="https://www.youtube.com/playlist?list=PL5BRv17qD4RUPGa_SBbUC_BT5Zry32zM2"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playKeyClick()}
            className="w-full p-4 rounded-2xl bg-rose-950/25 hover:bg-rose-950/45 active:scale-[0.985] border border-rose-600/35 hover:border-rose-400/60 transition-all duration-200 flex items-center justify-between text-left group shadow-[inset_0_1px_0_0_rgba(244,63,94,0.2),0_0_18px_rgba(244,63,94,0.12)] hover:shadow-[0_0_24px_rgba(244,63,94,0.22)]"
            aria-label="Open Best of 20s Bengali songs on YouTube"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-rose-950/50 text-rose-400 border border-rose-700/40 group-hover:scale-105 transition-transform">
                <Music2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-rose-200 tracking-wide group-hover:text-rose-100 transition-colors">
                  BEST OF 20s BENGALI SONGS
                </h4>
                <p className="text-xs text-neutral-400 mt-0.5 font-mono text-[11px]">
                  Official YouTube Playlist (PL5BRv17qD4RUPGa_SBbUC_BT5Zry32zM2)
                </p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-rose-400 group-hover:text-rose-300 group-hover:translate-x-0.5 transition-all" />
          </a>

          {/* Option 3: Open YouTube Music */}
          <a
            href="https://music.youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playKeyClick()}
            className="w-full p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] active:scale-[0.985] border border-white/[0.08] hover:border-red-500/40 transition-all duration-200 flex items-center justify-between text-left group shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] hover:shadow-[0_4px_20px_rgba(239,68,68,0.12)]"
            aria-label="Open YouTube Music official website"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-red-950/30 text-red-400 border border-red-800/30 group-hover:scale-105 transition-transform">
                <Music2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-neutral-100 tracking-wide group-hover:text-red-300 transition-colors">
                  OPEN YOUTUBE MUSIC
                </h4>
                <p className="text-xs text-neutral-400 mt-0.5 font-mono text-[11px]">
                  Official streaming service destination
                </p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-neutral-500 group-hover:text-neutral-300 group-hover:translate-x-0.5 transition-all" />
          </a>

          {/* Option 4: Open YouTube */}
          <a
            href="https://www.youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playKeyClick()}
            className="w-full p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] active:scale-[0.985] border border-white/[0.08] hover:border-white/20 transition-all duration-200 flex items-center justify-between text-left group shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
            aria-label="Open YouTube official website"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-white/5 text-neutral-300 border border-white/10 group-hover:scale-105 transition-transform">
                <Youtube className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-neutral-100 tracking-wide group-hover:text-white transition-colors">
                  OPEN YOUTUBE
                </h4>
                <p className="text-xs text-neutral-400 mt-0.5 font-mono text-[11px]">
                  Official video & playlist catalog
                </p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-neutral-500 group-hover:text-neutral-300 group-hover:translate-x-0.5 transition-all" />
          </a>

          {/* Compliance note */}
          <div className="mt-8 p-3.5 rounded-xl bg-black/40 border border-white/[0.06] text-[11px] font-mono text-neutral-400 leading-relaxed shadow-inner">
            <span className="font-['Noto_Serif_Bengali','Hind_Siliguri',serif]">মনের কথা</span> respects digital licensing. All external links connect directly to authorized official services without scraping or DRM bypassing.
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/[0.08] bg-black/40 flex items-center justify-between text-xs font-mono text-neutral-400">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-neutral-200 font-bengali tracking-tight drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)]">মনের কথা</span>
            <span className="tracking-[0.18em] text-[10px] text-neutral-400/90 font-medium">SOUND HUB</span>
          </div>
          <button
            onClick={() => {
              playKeyClick();
              onClose();
            }}
            className="text-neutral-400 hover:text-white underline active:scale-95 transition"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
};
