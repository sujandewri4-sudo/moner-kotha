import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Play, 
  Pause, 
  Shield, 
  ArrowLeft, 
  History, 
  Radio, 
  Database,
  Volume2
} from 'lucide-react';
import { RoyaltyFreeTrack, SearchHistoryItem } from '../types';
import { ROYALTY_FREE_CATALOG, searchRoyaltyFreeTracks } from '../data/royaltyFreeMusic';
import { playKeyClick } from '../utils/cyberCafeAmbience';

interface MusicSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOnline: boolean;
  onOpenLicense: (track: RoyaltyFreeTrack) => void;
}

const SEARCH_EXAMPLES = [
  'lofi',
  'cinematic',
  'Punjabi instrumental',
  'Bengali acoustic',
  'retro',
  'sad piano',
  'hip hop',
  'ambient',
  'Indian',
  'electronic',
  '2000s',
  'jazz',
];

const SEARCH_HISTORY_KEY = 'aiearnx_search_history_v1';

export const MusicSearchModal: React.FC<MusicSearchModalProps> = ({
  isOpen,
  onClose,
  isOnline,
  onOpenLicense,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<RoyaltyFreeTrack[]>(ROYALTY_FREE_CATALOG);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [isFromCache, setIsFromCache] = useState(false);
  
  // Preview audio state
  const [previewTrackId, setPreviewTrackId] = useState<string | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load search history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (stored) {
        setSearchHistory(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  // Keyboard close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Audio preview cleanup
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Handle Search
  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);

    if (!isOnline) {
      // Offline mode: Check if cached in history
      const cached = searchHistory.find(
        (item) => item.query.toLowerCase() === searchQuery.toLowerCase()
      );
      if (cached) {
        setResults(cached.results);
        setIsFromCache(true);
      } else {
        // Fallback to local catalog
        const res = searchRoyaltyFreeTracks(searchQuery);
        setResults(res);
        setIsFromCache(true);
      }
      return;
    }

    // Online live search
    setIsFromCache(false);
    const searchRes = searchRoyaltyFreeTracks(searchQuery);
    setResults(searchRes);

    // Save to history if non-empty
    if (searchQuery.trim().length > 1) {
      const newItem: SearchHistoryItem = {
        id: Date.now().toString(),
        query: searchQuery.trim(),
        timestamp: Date.now(),
        resultCount: searchRes.length,
        results: searchRes,
      };

      const updated = [newItem, ...searchHistory.filter((h) => h.query.toLowerCase() !== searchQuery.toLowerCase())].slice(0, 8);
      setSearchHistory(updated);
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
  };

  const handlePreviewToggle = (track: RoyaltyFreeTrack) => {
    playKeyClick();

    if (previewTrackId === track.id && isPreviewPlaying) {
      audioRef.current?.pause();
      setIsPreviewPlaying(false);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(track.previewUrl);
    audioRef.current = audio;
    setPreviewTrackId(track.id);
    setIsPreviewPlaying(true);

    audio.play().catch((err) => {
      console.warn('Audio preview play notice:', err);
      setIsPreviewPlaying(false);
    });

    audio.onended = () => {
      setIsPreviewPlaying(false);
    };

    audio.onerror = () => {
      setIsPreviewPlaying(false);
    };
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-2xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl h-[90vh] rounded-3xl bg-[#080d18]/92 backdrop-blur-2xl border border-white/[0.12] shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15),0_25px_65px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden text-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                playKeyClick();
                onClose();
              }}
              className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 active:scale-95 transition flex items-center gap-1.5 text-xs font-mono border border-transparent hover:border-white/10"
              aria-label="Back to মনের কথা"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline font-['Noto_Serif_Bengali','Hind_Siliguri',serif]">BACK TO মনের কথা</span>
            </button>
            <div className="h-4 w-px bg-white/10 hidden sm:block" />
            <h3 className="font-['Cinzel',serif] tracking-wider text-sm sm:text-base font-semibold bg-gradient-to-r from-white via-neutral-100 to-neutral-300 bg-clip-text text-transparent flex items-center gap-2">
              <span>MUSIC SEARCH</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] text-neutral-400 border border-white/[0.08]">
                ROYALTY-FREE &amp; CC0
              </span>
            </h3>
          </div>
          <button
            onClick={() => {
              playKeyClick();
              onClose();
            }}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 active:scale-95 transition border border-transparent hover:border-white/10"
            aria-label="Close music search modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Field & Chips */}
        <div className="p-4 sm:p-6 border-b border-white/[0.08] bg-black/30 space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search royalty-free music..."
              className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white/[0.035] hover:bg-white/[0.055] border border-white/[0.1] hover:border-white/20 focus:border-sky-400/50 focus:outline-none focus:shadow-[0_0_20px_rgba(56,189,248,0.15)] text-sm text-neutral-100 placeholder-neutral-500 font-sans tracking-wide transition-all shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]"
              autoFocus
            />
            {query && (
              <button
                onClick={() => handleSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-white active:scale-90 transition"
                aria-label="Clear search input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status & Cache Indicator */}
          <div className="flex items-center justify-between text-[11px] font-mono">
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">
                Showing {results.length} verified tracks
              </span>
              {isFromCache && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-800/40 text-[10px] font-semibold">
                  <Database className="w-3 h-3" />
                  CACHED RESULT
                </span>
              )}
            </div>

            {!isOnline && (
              <span className="text-amber-400 text-[10px]">
                Offline mode active — utilizing local cached catalog
              </span>
            )}
          </div>

          {/* Quick Filter Keyword Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
            <span className="text-[11px] font-mono text-neutral-500 flex-shrink-0 mr-1">
              TRY:
            </span>
            {SEARCH_EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => {
                  playKeyClick();
                  handleSearch(ex);
                }}
                className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-mono transition border ${
                  query.toLowerCase() === ex.toLowerCase()
                    ? 'bg-neutral-200 text-neutral-900 border-neutral-200 font-semibold'
                    : 'bg-white/[0.03] text-neutral-400 border-white/5 hover:bg-white/[0.08] hover:text-neutral-200'
                }`}
                aria-label={`Search for ${ex}`}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {results.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 font-mono text-xs">
              <p>No royalty-free tracks matched "{query}".</p>
              <p className="mt-2 text-neutral-600">
                Try searching for genres: lofi, cinematic, Punjabi instrumental, ambient, retro, sad piano.
              </p>
            </div>
          ) : (
            results.map((track) => {
              const isCurrentPreview = previewTrackId === track.id && isPreviewPlaying;
              return (
                <div
                  key={track.id}
                  className="p-4 rounded-2xl bg-white/[0.025] hover:bg-white/[0.055] border border-white/[0.07] hover:border-white/20 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.35)]"
                >
                  {/* Left: Track Information */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold text-neutral-100 group-hover:text-white tracking-wide truncate">
                        {track.title}
                      </h4>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 shadow-[0_0_8px_rgba(16,185,129,0.15)]">
                        {track.license}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-400 mt-1">
                      <span className="font-medium text-neutral-300">{track.artist}</span>
                      <span className="mx-2 text-neutral-600">•</span>
                      <span className="font-mono text-[11px] text-neutral-400">Source: {track.source}</span>
                    </p>

                    {/* Attribution Requirement display */}
                    <div className="mt-2 text-[11px] font-mono text-neutral-400 bg-black/40 px-2.5 py-1 rounded-lg border border-white/[0.06] inline-block shadow-inner">
                      <span className="text-neutral-500">Attribution: </span>
                      {track.attributionRequirement}
                    </div>
                  </div>

                  {/* Right: Actions (PREVIEW, LICENSE) */}
                  <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                    {/* PREVIEW Button */}
                    <button
                      onClick={() => handlePreviewToggle(track)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all duration-150 active:scale-95 border ${
                        isCurrentPreview
                          ? 'bg-neutral-100 text-neutral-950 border-neutral-100 font-semibold shadow-[0_0_18px_rgba(255,255,255,0.3)]'
                          : 'bg-white/[0.05] text-neutral-200 border-white/[0.1] hover:bg-white/[0.12] hover:border-white/25 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]'
                      }`}
                      aria-label={`Preview ${track.title}`}
                    >
                      {isCurrentPreview ? (
                        <>
                          <Pause className="w-3.5 h-3.5 fill-current" />
                          <span>PAUSE</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>PREVIEW</span>
                        </>
                      )}
                    </button>

                    {/* LICENSE Button */}
                    <button
                      onClick={() => {
                        playKeyClick();
                        onOpenLicense(track);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-mono bg-white/[0.03] hover:bg-white/[0.08] active:scale-95 text-neutral-300 hover:text-white border border-white/[0.08] hover:border-white/20 flex items-center gap-1.5 transition-all duration-150 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]"
                      aria-label={`View license for ${track.title}`}
                    >
                      <Shield className="w-3.5 h-3.5 text-neutral-400" />
                      <span>LICENSE</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-black/40 text-[10px] font-mono text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>NO SPOTIFY DEPENDENCY • LEGITIMATE CC & ROYALTY-FREE CATALOG ONLY</span>
          <span className="text-neutral-400">ALL AUDIO PREVIEWS PLAY VIA HTML5 WEB AUDIO</span>
        </div>
      </div>
    </div>
  );
};
