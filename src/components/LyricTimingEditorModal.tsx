import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Clock, 
  Music, 
  FileJson,
  Copy,
  Download,
  Upload,
  GripVertical,
  Sliders,
  Sparkles,
  ZoomIn,
  ZoomOut,
  MapPin,
  CornerDownRight,
  Wand2,
  Activity,
  Zap,
  Check,
  CheckCheck,
  RefreshCw,
  Mic,
  MicOff,
  FileAudio,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { PlaylistTrack } from '../types';
import { 
  TimedLyricLine, 
  getTimedLyricsForTrack, 
  saveCustomTrackLyrics, 
  deleteCustomTrackLyrics, 
  getCustomTrackLyrics,
  exportTrackLyricsAsJSON,
  importTrackLyricsFromJSON
} from '../services/lyricSyncService';
import { 
  AudioPeak, 
  AutoSyncOptions, 
  generateSpectralCadencePeaks, 
  analyzeAudioFileWithWebAudio,
  LiveAudioPeakDetector 
} from '../services/webAudioPeakDetector';
import { playKeyClick } from '../utils/cyberCafeAmbience';

interface LyricTimingEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrack?: PlaylistTrack | null;
  currentTime?: number;
  duration?: number;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  onSeek?: (seconds: number) => void;
}

function formatSeconds(sec: number): string {
  if (isNaN(sec) || sec < 0) return '00:00';
  const mins = Math.floor(sec / 60);
  const remainder = Math.floor(sec % 60);
  return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
}

export const LyricTimingEditorModal: React.FC<LyricTimingEditorModalProps> = ({
  isOpen,
  onClose,
  currentTrack,
  currentTime = 0,
  duration = 0,
  isPlaying = false,
  onTogglePlay,
  onSeek,
}) => {
  const [lines, setLines] = useState<TimedLyricLine[]>([]);
  const [activeTab, setActiveTab] = useState<'timeline' | 'autosync' | 'json'>('timeline');
  const [selectedLineIndex, setSelectedLineIndex] = useState<number | null>(null);
  const [timelineZoom, setTimelineZoom] = useState<1 | 2>(1);
  const [autoSaveNotification, setAutoSaveNotification] = useState<string | null>(null);
  const [copiedToast, setCopiedToast] = useState(false);
  const [draggedLineIndex, setDraggedLineIndex] = useState<number | null>(null);
  const [activeMarkerDragIndex, setActiveMarkerDragIndex] = useState<number | null>(null);
  const [isDropTargetActive, setIsDropTargetActive] = useState(false);

  // Auto-Sync Web Audio API Engine State
  const [autoSyncOptions, setAutoSyncOptions] = useState<AutoSyncOptions>({
    sensitivity: 65,
    minIntervalSeconds: 6,
    verseCount: 8,
    frequencyBand: 'vocal',
    introDelay: 6,
  });
  const [suggestedPeaks, setSuggestedPeaks] = useState<AudioPeak[]>([]);
  const [isLiveListening, setIsLiveListening] = useState(false);
  const [liveSpectrumData, setLiveSpectrumData] = useState<number[]>(new Array(24).fill(0));
  const [liveEnergyLevel, setLiveEnergyLevel] = useState(0);
  const [peakDetectedFlash, setPeakDetectedFlash] = useState(false);
  const [isAnalyzingFile, setIsAnalyzingFile] = useState(false);
  const [analyzedFileName, setAnalyzedFileName] = useState<string | null>(null);
  const [appliedNotification, setAppliedNotification] = useState<string | null>(null);

  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const timelineTrackRef = useRef<HTMLDivElement>(null);
  const liveDetectorRef = useRef<LiveAudioPeakDetector | null>(null);

  const trackDuration = Math.max(1, duration || currentTrack?.durationSeconds || 240);

  // Load lyrics on open or track change
  useEffect(() => {
    if (!isOpen || !currentTrack) return;
    const custom = getCustomTrackLyrics(currentTrack.id);
    let initialLines: TimedLyricLine[] = [];
    if (custom && custom.length > 0) {
      initialLines = custom;
    } else {
      initialLines = getTimedLyricsForTrack(currentTrack);
    }
    setLines(initialLines);
    setSelectedLineIndex(0);

    // Sync verse count in options to match track lyrics count
    setAutoSyncOptions((prev) => ({
      ...prev,
      verseCount: Math.max(4, initialLines.length),
    }));
  }, [isOpen, currentTrack]);

  // Generate suggested peaks automatically when track or options change
  const refreshSpectralPeaks = useCallback(() => {
    if (!currentTrack) return;
    const peaks = generateSpectralCadencePeaks(trackDuration, autoSyncOptions, currentTrack.id);
    setSuggestedPeaks(peaks);
  }, [trackDuration, autoSyncOptions, currentTrack]);

  useEffect(() => {
    if (!analyzedFileName) {
      refreshSpectralPeaks();
    }
  }, [refreshSpectralPeaks, analyzedFileName]);

  // Clean up live audio detector when unmounting
  useEffect(() => {
    return () => {
      if (liveDetectorRef.current) {
        liveDetectorRef.current.stopListening();
        liveDetectorRef.current = null;
      }
    };
  }, []);

  // Automatic saving helper that updates localStorage & master JSON map
  const autoSaveToStorage = useCallback(
    (newLines: TimedLyricLine[], message = 'Auto-saved JSON map to localStorage') => {
      if (!currentTrack) return;
      saveCustomTrackLyrics(currentTrack.id, newLines, {
        title: currentTrack.title,
        artist: currentTrack.artist,
        durationSeconds: currentTrack.durationSeconds,
      });
      setAutoSaveNotification(message);
      setTimeout(() => setAutoSaveNotification(null), 2500);
    },
    [currentTrack]
  );

  // Line updater
  const handleUpdateLine = (index: number, field: keyof TimedLyricLine, value: any) => {
    setLines((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      const sorted = next.sort((a, b) => a.time - b.time);
      autoSaveToStorage(sorted);
      return sorted;
    });
  };

  // Add line at current playhead
  const handleAddLineAtPlayhead = () => {
    playKeyClick();
    const stamp = Math.floor(currentTime);
    const newLine: TimedLyricLine = {
      time: stamp,
      text: 'নতুন লিরিক্স লাইন...',
      hint: currentTrack?.title,
    };
    const next = [...lines, newLine].sort((a, b) => a.time - b.time);
    setLines(next);
    setSelectedLineIndex(next.findIndex((l) => l.time === stamp));
    autoSaveToStorage(next, `Added marker at ${formatSeconds(stamp)} & saved to JSON`);
  };

  // Delete line
  const handleDeleteLine = (index: number) => {
    playKeyClick();
    const next = lines.filter((_, idx) => idx !== index);
    setLines(next);
    if (selectedLineIndex === index) {
      setSelectedLineIndex(null);
    }
    autoSaveToStorage(next, 'Deleted marker and updated JSON map');
  };

  // Reset to default
  const handleResetToDefault = () => {
    if (!currentTrack) return;
    playKeyClick();
    deleteCustomTrackLyrics(currentTrack.id);
    const defaults = getTimedLyricsForTrack(currentTrack);
    setLines(defaults);
    setAutoSaveNotification('Reverted to default timestamps');
    setTimeout(() => setAutoSaveNotification(null), 2500);
  };

  // Convert timeline clientX into track seconds
  const calculateSecondsFromEvent = useCallback(
    (clientX: number): number => {
      if (!timelineTrackRef.current) return 0;
      const rect = timelineTrackRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return Math.round(ratio * trackDuration);
    },
    [trackDuration]
  );

  // Drag and drop: Drag lyric card from list onto timeline
  const handleDragStartCard = (index: number, e: React.DragEvent) => {
    setDraggedLineIndex(index);
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOverTimeline = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropTargetActive(true);
  };

  const handleDragLeaveTimeline = () => {
    setIsDropTargetActive(false);
  };

  const handleDropOnTimeline = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropTargetActive(false);
    const droppedIndex = draggedLineIndex;
    if (droppedIndex === null || droppedIndex === undefined || !lines[droppedIndex]) return;

    const newTime = calculateSecondsFromEvent(e.clientX);
    playKeyClick();

    const next = [...lines];
    next[droppedIndex] = { ...next[droppedIndex], time: newTime };
    const sorted = next.sort((a, b) => a.time - b.time);
    setLines(sorted);
    setSelectedLineIndex(sorted.findIndex((l) => l.time === newTime));
    setDraggedLineIndex(null);

    if (onSeek) onSeek(newTime);
    autoSaveToStorage(sorted, `Marker dropped at ${formatSeconds(newTime)} • JSON Map Updated`);
  };

  // Interactive Playhead scrubbing via mouse/touch
  const handleTimelineMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-marker-pin]')) return;
    playKeyClick();
    const sec = calculateSecondsFromEvent(e.clientX);
    if (onSeek) onSeek(sec);
  };

  // Marker Pin Dragger across timeline track
  const handleStartMarkerDrag = (index: number, e: React.PointerEvent) => {
    e.stopPropagation();
    playKeyClick();
    setActiveMarkerDragIndex(index);
    setSelectedLineIndex(index);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMoveMarker = (e: React.PointerEvent) => {
    if (activeMarkerDragIndex === null || !lines[activeMarkerDragIndex]) return;
    const newTime = calculateSecondsFromEvent(e.clientX);

    setLines((prev) => {
      const next = [...prev];
      next[activeMarkerDragIndex] = { ...next[activeMarkerDragIndex], time: newTime };
      return next;
    });

    if (onSeek) onSeek(newTime);
  };

  const handlePointerUpMarker = (e: React.PointerEvent) => {
    if (activeMarkerDragIndex !== null) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      const sorted = [...lines].sort((a, b) => a.time - b.time);
      setLines(sorted);
      autoSaveToStorage(sorted, 'Marker position saved to JSON map in localStorage');
      setActiveMarkerDragIndex(null);
    }
  };

  // Copy JSON map to clipboard
  const handleCopyJSON = () => {
    if (!currentTrack) return;
    playKeyClick();
    const jsonStr = exportTrackLyricsAsJSON(currentTrack.id, currentTrack);
    navigator.clipboard.writeText(jsonStr);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2200);
  };

  // Download JSON file
  const handleDownloadJSON = () => {
    if (!currentTrack) return;
    playKeyClick();
    const jsonStr = exportTrackLyricsAsJSON(currentTrack.id, currentTrack);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lyrics_${currentTrack.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON file
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentTrack) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      const success = importTrackLyricsFromJSON(currentTrack.id, content);
      if (success) {
        const loaded = getCustomTrackLyrics(currentTrack.id);
        if (loaded) setLines(loaded);
        setAutoSaveNotification('Successfully imported JSON map into localStorage');
        setTimeout(() => setAutoSaveNotification(null), 2500);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // ==========================================
  // WEB AUDIO API AUTO-SYNC ACTIONS
  // ==========================================

  // Apply all suggested peaks directly to lyrics lines
  const handleApplyAllPeaksToLyrics = () => {
    if (!suggestedPeaks || suggestedPeaks.length === 0 || lines.length === 0) return;
    playKeyClick();

    const next = lines.map((line, idx) => {
      if (suggestedPeaks[idx]) {
        return {
          ...line,
          time: suggestedPeaks[idx].time,
        };
      }
      return line;
    });

    const sorted = next.sort((a, b) => a.time - b.time);
    setLines(sorted);
    autoSaveToStorage(
      sorted,
      `Auto-synced ${Math.min(lines.length, suggestedPeaks.length)} verses to Web Audio peaks!`
    );
    setAppliedNotification(`Successfully aligned ${Math.min(lines.length, suggestedPeaks.length)} lyric verses to detected peaks!`);
    setTimeout(() => setAppliedNotification(null), 3500);
  };

  // Snap existing markers to nearest detected audio peak (within ±3s)
  const handleSnapExistingToPeaks = () => {
    if (suggestedPeaks.length === 0) return;
    playKeyClick();

    let snappedCount = 0;
    const next = lines.map((line) => {
      // Find closest peak within 3 seconds
      let closestPeak: AudioPeak | null = null;
      let minDiff = 3.5;

      for (const p of suggestedPeaks) {
        const diff = Math.abs(p.time - line.time);
        if (diff < minDiff) {
          minDiff = diff;
          closestPeak = p;
        }
      }

      if (closestPeak && minDiff > 0.4) {
        snappedCount++;
        return { ...line, time: closestPeak.time };
      }
      return line;
    });

    const sorted = next.sort((a, b) => a.time - b.time);
    setLines(sorted);
    autoSaveToStorage(sorted, `Snapped ${snappedCount} markers to nearest audio transients`);
    setAppliedNotification(`Snapped ${snappedCount} lyric markers onto audio frequency peaks!`);
    setTimeout(() => setAppliedNotification(null), 3500);
  };

  // Add individual peak as a new lyric line
  const handleAddPeakAsLine = (peak: AudioPeak) => {
    playKeyClick();
    const newLine: TimedLyricLine = {
      time: peak.time,
      text: 'নতুন লিরিক্স লাইন...',
      hint: peak.description,
    };
    const next = [...lines, newLine].sort((a, b) => a.time - b.time);
    setLines(next);
    setSelectedLineIndex(next.findIndex((l) => l.time === peak.time));
    autoSaveToStorage(next, `Added marker at peak ${formatSeconds(peak.time)}`);
  };

  // Toggle Live Web Audio Capture (Mic / System tab stream)
  const handleToggleLiveAudio = async () => {
    playKeyClick();
    if (isLiveListening) {
      if (liveDetectorRef.current) {
        liveDetectorRef.current.stopListening();
        liveDetectorRef.current = null;
      }
      setIsLiveListening(false);
    } else {
      const detector = new LiveAudioPeakDetector();
      const success = await detector.startListening(
        (data, energy) => {
          // Downsample 256 bins to 24 visual bars
          const bars: number[] = [];
          const step = Math.floor(data.length / 24);
          for (let b = 0; b < 24; b++) {
            let sum = 0;
            for (let s = 0; s < step; s++) sum += data[b * step + s];
            bars.push(Math.round((sum / (step * 255)) * 100));
          }
          setLiveSpectrumData(bars);
          setLiveEnergyLevel(energy);
        },
        (peak) => {
          // Flash indicator on onset
          setPeakDetectedFlash(true);
          setTimeout(() => setPeakDetectedFlash(false), 300);

          // If playing, automatically capture current playback second as a suggested peak
          const currentSec = Math.floor(currentTime);
          setSuggestedPeaks((prev) => {
            if (prev.some((p) => Math.abs(p.time - currentSec) < 3)) return prev;
            const newPeak: AudioPeak = {
              ...peak,
              time: currentSec,
              formattedTime: formatSeconds(currentSec),
              description: `Live onset captured at ${formatSeconds(currentSec)}`,
            };
            return [...prev, newPeak].sort((a, b) => a.time - b.time);
          });
        },
        autoSyncOptions
      );

      if (success) {
        liveDetectorRef.current = detector;
        setIsLiveListening(true);
      }
    }
  };

  // Handle local audio file upload for 100% offline Web Audio decodeAudioData analysis
  const handleUploadAudioFileForAnalysis = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsAnalyzingFile(true);
      playKeyClick();
      const decodedPeaks = await analyzeAudioFileWithWebAudio(file, autoSyncOptions);
      setSuggestedPeaks(decodedPeaks);
      setAnalyzedFileName(file.name);
      setAppliedNotification(
        `Web Audio API decoded ${decodedPeaks.length} transient peaks from "${file.name}"!`
      );
      setTimeout(() => setAppliedNotification(null), 3500);
    } catch (err) {
      console.error('Error analyzing audio file:', err);
      setAutoSaveNotification('Failed to decode audio file');
      setTimeout(() => setAutoSaveNotification(null), 3000);
    } finally {
      setIsAnalyzingFile(false);
      e.target.value = '';
    }
  };

  if (!isOpen) return null;

  // Active playing lyric index
  let activeLyricIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (currentTime >= lines[i].time) {
      activeLyricIdx = i;
    } else {
      break;
    }
  }

  const playheadPercent = Math.min(100, (currentTime / trackDuration) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div 
        className="relative w-full max-w-5xl bg-[#0c0f18] border border-white/[0.14] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col h-[92vh] max-h-[880px] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dashboard-title"
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/[0.08] bg-black/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="dashboard-title" className="text-sm sm:text-base font-mono font-bold tracking-wider text-neutral-100 uppercase">
                  LYRIC TIMING STUDIO DASHBOARD
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[9px] font-mono tracking-wider uppercase bg-rose-500/15 border border-rose-500/30 text-rose-300">
                  WEB AUDIO API POWERED
                </span>
              </div>
              <p className="text-[11px] font-mono text-neutral-400 truncate max-w-sm sm:max-w-xl">
                {currentTrack ? `${currentTrack.title} — ${currentTrack.artist}` : 'No track active'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Auto-save notification pill */}
            {autoSaveNotification && (
              <span className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 animate-fade-in">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{autoSaveNotification}</span>
              </span>
            )}

            {/* Tab switchers: Timeline vs Auto-Sync vs JSON Map */}
            <div className="flex items-center rounded-lg bg-black/60 p-0.5 border border-white/[0.08]">
              <button
                onClick={() => {
                  playKeyClick();
                  setActiveTab('timeline');
                }}
                className={`px-3 py-1 rounded-md text-xs font-mono transition-colors ${
                  activeTab === 'timeline' 
                    ? 'bg-rose-500/20 text-rose-200 border border-rose-500/30 font-bold' 
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                TIMELINE
              </button>

              <button
                onClick={() => {
                  playKeyClick();
                  setActiveTab('autosync');
                }}
                className={`px-3 py-1 rounded-md text-xs font-mono transition-colors flex items-center gap-1.5 ${
                  activeTab === 'autosync' 
                    ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 font-bold shadow-[0_0_12px_rgba(16,185,129,0.25)]' 
                    : 'text-emerald-400/90 hover:text-emerald-300'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>AUTO-SYNC</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </button>

              <button
                onClick={() => {
                  playKeyClick();
                  setActiveTab('json');
                }}
                className={`px-3 py-1 rounded-md text-xs font-mono transition-colors flex items-center gap-1 ${
                  activeTab === 'json' 
                    ? 'bg-rose-500/20 text-rose-200 border border-rose-500/30 font-bold' 
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <FileJson className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">JSON MAP</span>
              </button>
            </div>

            <button
              onClick={() => {
                playKeyClick();
                onClose();
              }}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-colors ml-2"
              aria-label="Close studio dashboard"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Studio Timeline Bar & Playhead Header */}
        <div className="px-4 sm:px-6 py-2.5 bg-black/40 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {onTogglePlay && (
              <button
                onClick={() => {
                  playKeyClick();
                  onTogglePlay();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white flex items-center gap-1.5 transition-all font-mono text-xs font-bold shadow-[0_0_15px_rgba(244,63,94,0.4)]"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
              </button>
            )}

            {/* Jump Buttons */}
            {onSeek && (
              <div className="flex items-center gap-1 text-neutral-400">
                <button
                  onClick={() => {
                    playKeyClick();
                    onSeek(Math.max(0, currentTime - 5));
                  }}
                  className="px-2 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] text-[10px] font-mono border border-white/[0.08]"
                  title="Rewind 5s"
                >
                  -5s
                </button>
                <button
                  onClick={() => {
                    playKeyClick();
                    onSeek(Math.min(trackDuration, currentTime + 5));
                  }}
                  className="px-2 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] text-[10px] font-mono border border-white/[0.08]"
                  title="Forward 5s"
                >
                  +5s
                </button>
              </div>
            )}

            {/* Realtime Playback Counter */}
            <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-200">
              <span className="text-rose-300 font-bold text-sm">{formatSeconds(currentTime)}</span>
              <span className="text-neutral-500">/</span>
              <span className="text-neutral-400">{formatSeconds(trackDuration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct Auto-Sync Action Button */}
            <button
              onClick={() => {
                playKeyClick();
                setActiveTab('autosync');
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(16,185,129,0.15)]"
              title="Open Web Audio Peak Auto-Sync to finalize lyric timing in 1-click"
            >
              <Wand2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>AUTO-SYNC PEAKS ({suggestedPeaks.length})</span>
            </button>

            {/* Quick Button to drop marker at playhead */}
            <button
              onClick={handleAddLineAtPlayhead}
              className="px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] text-neutral-200 text-xs font-mono flex items-center gap-1.5 transition-colors shadow-sm"
              title="Add a new lyric marker at current audio playhead position"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">MARK AT PLAYHEAD ({formatSeconds(currentTime)})</span>
              <span className="sm:hidden">MARK ({formatSeconds(currentTime)})</span>
            </button>

            {/* Zoom toggler */}
            <button
              onClick={() => setTimelineZoom(timelineZoom === 1 ? 2 : 1)}
              className="px-2.5 py-1.5 rounded-xl bg-black/40 hover:bg-white/[0.08] border border-white/[0.08] text-neutral-300 text-xs font-mono flex items-center gap-1"
              title="Toggle Timeline Zoom (1x / 2x)"
            >
              {timelineZoom === 1 ? <ZoomIn className="w-3.5 h-3.5" /> : <ZoomOut className="w-3.5 h-3.5" />}
              <span className="text-[10px]">{timelineZoom}x</span>
            </button>
          </div>
        </div>

        {/* Visual Audio Waveform Timeline with Draggable Markers & Suggested Peak Guides */}
        <div 
          ref={timelineContainerRef}
          className="px-4 sm:px-6 py-3.5 bg-[#080b13] border-b border-white/[0.08] overflow-x-auto scrollbar-thin scrollbar-thumb-rose-500/20 select-none"
        >
          <div 
            className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mb-1.5 px-1"
            style={{ width: `${timelineZoom * 100}%` }}
          >
            <span className="flex items-center gap-1.5 text-rose-300">
              <MapPin className="w-3 h-3" />
              <span>TIMELINE RULER &amp; WEB AUDIO FREQUENCY TRACK</span>
            </span>
            <span className="text-neutral-400 italic hidden sm:inline">
              Dotted green ticks indicate Web Audio API detected frequency peaks
            </span>
          </div>

          {/* Interactive Ruler & Scrubber Track */}
          <div
            ref={timelineTrackRef}
            onMouseDown={handleTimelineMouseDown}
            onDragOver={handleDragOverTimeline}
            onDragLeave={handleDragLeaveTimeline}
            onDrop={handleDropOnTimeline}
            className={`relative h-20 rounded-xl cursor-pointer transition-all border ${
              isDropTargetActive 
                ? 'border-rose-400 bg-rose-950/30 shadow-[0_0_25px_rgba(244,63,94,0.35)]' 
                : 'border-white/[0.1] bg-black/60 hover:border-white/20'
            }`}
            style={{ width: `${timelineZoom * 100}%` }}
          >
            {/* Simulated Audio Waveform Bars */}
            <div className="absolute inset-0 flex items-center justify-between px-2 opacity-25 pointer-events-none">
              {Array.from({ length: 90 * timelineZoom }).map((_, i) => {
                const heightPercent = 20 + Math.sin(i * 0.4) * 35 + ((i % 5) * 8);
                const isPassed = (i / (90 * timelineZoom)) * 100 <= playheadPercent;
                return (
                  <div
                    key={i}
                    className={`w-0.5 rounded-full transition-colors ${
                      isPassed ? 'bg-rose-400' : 'bg-neutral-500'
                    }`}
                    style={{ height: `${Math.max(10, Math.min(85, heightPercent))}%` }}
                  />
                );
              })}
            </div>

            {/* Web Audio API Suggested Frequency Peaks Guides (Green Dotted Flags) */}
            {suggestedPeaks.map((peak, pIdx) => {
              const peakPercent = Math.min(100, Math.max(0, (peak.time / trackDuration) * 100));
              return (
                <div
                  key={`guide-${peak.id || pIdx}`}
                  className="absolute top-0 bottom-0 pointer-events-none z-10 flex flex-col items-center"
                  style={{ left: `${peakPercent}%` }}
                  title={`[Suggested Peak] ${peak.formattedTime}: ${peak.description}`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 -mt-0.5" />
                  <div className="w-px flex-1 border-l border-dashed border-emerald-500/30" />
                </div>
              );
            })}

            {/* Time Ticks along the bottom */}
            <div className="absolute bottom-1 inset-x-2 flex justify-between text-[9px] font-mono text-neutral-400 pointer-events-none">
              <span>00:00</span>
              <span>{formatSeconds(trackDuration * 0.25)}</span>
              <span>{formatSeconds(trackDuration * 0.5)}</span>
              <span>{formatSeconds(trackDuration * 0.75)}</span>
              <span>{formatSeconds(trackDuration)}</span>
            </div>

            {/* Active Playhead (Vertical Red/Rose Line with Tooltip) */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.8)] z-30 pointer-events-none"
              style={{ left: `${playheadPercent}%` }}
            >
              <div className="absolute -top-2.5 -translate-x-1/2 px-1.5 py-0.5 rounded bg-rose-500 text-white font-mono text-[9px] font-bold shadow-md">
                {formatSeconds(currentTime)}
              </div>
            </div>

            {/* Interactive Draggable Lyric Timestamp Markers along Timeline */}
            {lines.map((line, idx) => {
              const markerPercent = Math.min(100, Math.max(0, (line.time / trackDuration) * 100));
              const isActive = idx === activeLyricIdx;
              const isSelected = idx === selectedLineIndex;

              return (
                <div
                  key={idx}
                  data-marker-pin="true"
                  onPointerDown={(e) => handleStartMarkerDrag(idx, e)}
                  onPointerMove={handlePointerMoveMarker}
                  onPointerUp={handlePointerUpMarker}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedLineIndex(idx);
                    if (onSeek) onSeek(line.time);
                  }}
                  className={`absolute top-1 bottom-1 w-2 -translate-x-1/2 z-20 group cursor-ew-resize flex flex-col items-center justify-between`}
                  style={{ left: `${markerPercent}%` }}
                  title={`[Marker #${idx + 1}] ${formatSeconds(line.time)}: "${line.text}" (Drag horizontally to adjust)`}
                >
                  {/* Top Flag / Badge */}
                  <div
                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition-all shadow-md ${
                      isSelected
                        ? 'bg-amber-400 text-black scale-110 ring-2 ring-amber-300'
                        : isActive
                        ? 'bg-rose-500 text-white shadow-[0_0_10px_rgba(244,63,94,0.7)]'
                        : 'bg-neutral-800 text-neutral-300 border border-white/20 group-hover:bg-neutral-700'
                    }`}
                  >
                    M{idx + 1}
                  </div>

                  {/* Marker Pin Line */}
                  <div
                    className={`w-0.5 flex-1 transition-colors ${
                      isSelected ? 'bg-amber-400' : isActive ? 'bg-rose-400' : 'bg-white/30 group-hover:bg-white/60'
                    }`}
                  />

                  {/* Bottom Timestamp */}
                  <div className="text-[8px] font-mono text-neutral-400 bg-black/80 px-1 rounded">
                    {formatSeconds(line.time)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tab 1: Timeline Mode */}
        {activeTab === 'timeline' && (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden bg-black/30">
            {/* Left: Interactive Lyric Marker List with Drag Handles */}
            <div className="md:col-span-7 flex flex-col border-r border-white/[0.08] overflow-hidden">
              <div className="px-4 py-2.5 bg-black/40 border-b border-white/[0.06] flex items-center justify-between text-xs font-mono text-neutral-300">
                <span className="font-semibold text-neutral-200">
                  LYRICS MARKER LIST ({lines.length} VERSES)
                </span>
                <span className="text-[10px] text-neutral-500">
                  Drag card handle to ruler or edit seconds directly
                </span>
              </div>

              {/* Scrollable list */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-white/10">
                {lines.length === 0 ? (
                  <div className="py-16 text-center text-neutral-500 font-mono text-xs">
                    <Music className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No lyric markers yet.</p>
                    <p className="mt-1 text-[11px]">Click "MARK AT PLAYHEAD" or "AUTO-SYNC" above.</p>
                  </div>
                ) : (
                  lines.map((line, idx) => {
                    const isActive = idx === activeLyricIdx;
                    const isSelected = idx === selectedLineIndex;

                    return (
                      <div
                        key={idx}
                        draggable
                        onDragStart={(e) => handleDragStartCard(idx, e)}
                        onClick={() => setSelectedLineIndex(idx)}
                        className={`group relative flex items-center gap-2 p-2.5 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-rose-950/20 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                            : isActive
                            ? 'bg-black/60 border-rose-400/30'
                            : 'bg-black/40 hover:bg-black/60 border-white/[0.06] hover:border-white/[0.15]'
                        }`}
                      >
                        {/* Drag Grip Handle */}
                        <div 
                          className="cursor-grab active:cursor-grabbing p-1 text-neutral-500 hover:text-white"
                          title="Drag this card onto the timeline ruler to set timestamp"
                        >
                          <GripVertical className="w-4 h-4" />
                        </div>

                        {/* Marker Badge */}
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold ${
                            isSelected
                              ? 'bg-amber-400 text-black'
                              : isActive
                              ? 'bg-rose-500 text-white'
                              : 'bg-white/[0.08] text-neutral-300'
                          }`}
                        >
                          {idx + 1}
                        </div>

                        {/* Timestamp Input */}
                        <div className="flex items-center gap-1 bg-black/60 border border-white/[0.1] rounded-lg px-2 py-1 text-xs font-mono">
                          <input
                            type="number"
                            min={0}
                            max={trackDuration}
                            value={line.time}
                            onChange={(e) =>
                              handleUpdateLine(idx, 'time', Math.max(0, parseInt(e.target.value) || 0))
                            }
                            className="w-12 bg-transparent text-rose-300 font-bold outline-none text-right font-mono"
                          />
                          <span className="text-[10px] text-neutral-500">s</span>
                        </div>

                        {/* Timestamp human readable */}
                        <span className="text-[10px] font-mono text-neutral-400 w-11">
                          ({formatSeconds(line.time)})
                        </span>

                        {/* Lyric Text Input */}
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={line.text}
                            onChange={(e) => handleUpdateLine(idx, 'text', e.target.value)}
                            className="w-full bg-transparent border-b border-transparent hover:border-white/20 focus:border-rose-400 px-1 py-0.5 text-xs sm:text-sm font-bengali text-neutral-100 outline-none"
                            placeholder="বাংলা লিরিক্স লিখুন..."
                          />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                          {/* Stamp with current time */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              playKeyClick();
                              handleUpdateLine(idx, 'time', Math.floor(currentTime));
                            }}
                            className="p-1 rounded bg-white/[0.06] hover:bg-rose-500/20 text-neutral-400 hover:text-rose-300 border border-white/[0.08]"
                            title="Set to current playhead time"
                          >
                            <Clock className="w-3.5 h-3.5" />
                          </button>

                          {/* Seek audio to this line */}
                          {onSeek && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                playKeyClick();
                                onSeek(line.time);
                              }}
                              className="p-1 rounded bg-white/[0.06] hover:bg-emerald-500/20 text-neutral-400 hover:text-emerald-300 border border-white/[0.08]"
                              title="Play from this timestamp"
                            >
                              <CornerDownRight className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteLine(idx);
                            }}
                            className="p-1 rounded hover:bg-rose-500/15 text-neutral-500 hover:text-rose-400"
                            title="Delete verse"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right: Active Marker Inspector & Quick Tools */}
            <div className="md:col-span-5 flex flex-col bg-black/20 p-4 sm:p-5 overflow-y-auto">
              <div className="text-xs font-mono font-bold tracking-wider text-neutral-300 uppercase mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                  <span>MARKER INSPECTOR</span>
                </span>
                <button
                  onClick={() => {
                    playKeyClick();
                    setActiveTab('autosync');
                  }}
                  className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 font-mono"
                >
                  <Wand2 className="w-3 h-3" />
                  <span>AUTO-SYNC</span>
                </button>
              </div>

              {selectedLineIndex !== null && lines[selectedLineIndex] ? (
                <div className="p-4 rounded-xl bg-black/40 border border-white/[0.1] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-300">
                      SELECTED: VERSE #{selectedLineIndex + 1}
                    </span>
                    <span className="text-xs font-mono text-rose-300 font-bold">
                      {formatSeconds(lines[selectedLineIndex].time)} ({lines[selectedLineIndex].time}s)
                    </span>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-neutral-400 block mb-1">LYRIC TEXT</label>
                    <textarea
                      rows={2}
                      value={lines[selectedLineIndex].text}
                      onChange={(e) => handleUpdateLine(selectedLineIndex, 'text', e.target.value)}
                      className="w-full bg-black/60 border border-white/[0.12] rounded-lg p-2 text-sm font-bengali text-white outline-none focus:border-rose-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-neutral-400 block mb-1">ARTIST / ALBUM HINT</label>
                    <input
                      type="text"
                      value={lines[selectedLineIndex].hint || ''}
                      onChange={(e) => handleUpdateLine(selectedLineIndex, 'hint', e.target.value)}
                      className="w-full bg-black/60 border border-white/[0.12] rounded-lg px-2.5 py-1.5 text-xs font-mono text-neutral-200 outline-none focus:border-rose-400"
                      placeholder="e.g. কবীর সুমন বা গানটি সম্পর্কে টীকা"
                    />
                  </div>

                  {/* Nudge Time Buttons */}
                  <div>
                    <label className="text-[10px] font-mono text-neutral-400 block mb-1.5">FINE-TUNE TIMESTAMP</label>
                    <div className="grid grid-cols-4 gap-1.5 text-xs font-mono">
                      <button
                        onClick={() =>
                          handleUpdateLine(
                            selectedLineIndex,
                            'time',
                            Math.max(0, lines[selectedLineIndex].time - 1)
                          )
                        }
                        className="py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-neutral-300"
                      >
                        -1s
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateLine(
                            selectedLineIndex,
                            'time',
                            lines[selectedLineIndex].time + 1
                          )
                        }
                        className="py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-neutral-300"
                      >
                        +1s
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateLine(
                            selectedLineIndex,
                            'time',
                            Math.floor(currentTime)
                          )
                        }
                        className="col-span-2 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 font-bold"
                      >
                        SNAP TO CURRENT ({formatSeconds(currentTime)})
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-black/30 border border-white/[0.06] text-center text-xs font-mono text-neutral-500">
                  Select a lyric marker above to inspect or fine-tune.
                </div>
              )}

              {/* LocalStorage Status Card */}
              <div className="mt-4 p-3.5 rounded-xl bg-black/40 border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-400">JSON STORAGE STATUS</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    AUTO-SAVED
                  </span>
                </div>
                <p className="text-[11px] font-mono text-neutral-400 leading-relaxed">
                  Every change is immediately recorded to local storage. FloatingLyricsOverlay syncs in real-time.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleCopyJSON}
                    className="flex-1 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-neutral-200 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5 text-rose-300" />
                    <span>{copiedToast ? 'COPIED!' : 'COPY JSON'}</span>
                  </button>
                  <button
                    onClick={handleDownloadJSON}
                    className="py-1.5 px-3 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-neutral-200 text-xs font-mono flex items-center gap-1.5 transition-colors"
                    title="Export JSON File"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-400" />
                    <span>EXPORT</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Web Audio API Auto-Sync Mode */}
        {activeTab === 'autosync' && (
          <div className="flex-1 flex flex-col md:grid md:grid-cols-12 overflow-hidden bg-black/35">
            {/* Left Controls & Visualizer Column */}
            <div className="md:col-span-5 flex flex-col p-4 sm:p-5 border-r border-white/[0.08] overflow-y-auto space-y-4">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
                  <Wand2 className="w-4 h-4" />
                  <span>WEB AUDIO API PEAK DETECTOR</span>
                </div>
                <p className="text-[11px] font-mono text-neutral-400 mt-1 leading-relaxed">
                  Analyzes vocal band frequencies (300Hz–3.4kHz) &amp; transient onset energy to automatically calculate lyric timestamps.
                </p>
              </div>

              {/* Status Alert */}
              {appliedNotification && (
                <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs font-mono flex items-center gap-2 animate-fade-in shadow-md">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{appliedNotification}</span>
                </div>
              )}

              {/* Real-time Spectrum Visualizer & Mic Stream */}
              <div className="p-3.5 rounded-xl bg-black/60 border border-white/[0.1] space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-300 font-semibold flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span>FREQUENCY SPECTRUM</span>
                  </span>
                  {peakDetectedFlash && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-rose-500 text-white font-bold animate-ping">
                      PEAK!
                    </span>
                  )}
                </div>

                {/* 24-Bar Spectrum Visualizer */}
                <div className="h-16 flex items-end justify-between gap-1 px-2 py-1.5 bg-black/80 rounded-lg border border-white/[0.06]">
                  {liveSpectrumData.map((val, bIdx) => (
                    <div
                      key={bIdx}
                      className={`w-full rounded-t-sm transition-all duration-75 ${
                        val > 65
                          ? 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                          : val > 35
                          ? 'bg-amber-400'
                          : 'bg-emerald-400/80'
                      }`}
                      style={{ height: `${Math.max(6, val)}%` }}
                    />
                  ))}
                </div>

                {/* Live Mic / Audio Capture Button */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={handleToggleLiveAudio}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 border transition-all ${
                      isLiveListening
                        ? 'bg-rose-950/60 border-rose-500/60 text-rose-200'
                        : 'bg-white/[0.06] hover:bg-white/[0.12] border-white/[0.1] text-neutral-300'
                    }`}
                  >
                    {isLiveListening ? <MicOff className="w-3.5 h-3.5 text-rose-400 animate-pulse" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
                    <span>{isLiveListening ? 'STOP LIVE LISTENER' : 'START LIVE AUDIO CAPTURE'}</span>
                  </button>

                  {/* File Upload for Offline decodeAudioData */}
                  <label className="cursor-pointer px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.08] text-neutral-300 text-xs font-mono flex items-center gap-1.5 transition-colors">
                    <FileAudio className="w-3.5 h-3.5 text-sky-400" />
                    <span>{isAnalyzingFile ? 'DECODING...' : 'DECODE FILE'}</span>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleUploadAudioFileForAnalysis}
                      disabled={isAnalyzingFile}
                      className="hidden"
                    />
                  </label>
                </div>

                {analyzedFileName && (
                  <p className="text-[10px] font-mono text-sky-300 truncate">
                    Loaded PCM audio: {analyzedFileName}
                  </p>
                )}
              </div>

              {/* Detection Settings Panel */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.08] space-y-3 text-xs font-mono">
                <div className="flex items-center justify-between text-neutral-300 font-semibold border-b border-white/[0.06] pb-1.5">
                  <span>DSP DETECTION PARAMETERS</span>
                  <button
                    onClick={() => {
                      playKeyClick();
                      refreshSpectralPeaks();
                    }}
                    className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>RE-SCAN</span>
                  </button>
                </div>

                {/* Sensitivity Slider */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
                    <span>PEAK SENSITIVITY</span>
                    <span className="text-rose-300 font-bold">{autoSyncOptions.sensitivity}%</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={95}
                    value={autoSyncOptions.sensitivity}
                    onChange={(e) =>
                      setAutoSyncOptions((prev) => ({
                        ...prev,
                        sensitivity: Number(e.target.value),
                      }))
                    }
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  />
                </div>

                {/* Verse Count Target */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
                    <span>TARGET VERSE COUNT</span>
                    <span className="text-amber-300 font-bold">{autoSyncOptions.verseCount} verses</span>
                  </div>
                  <input
                    type="range"
                    min={4}
                    max={24}
                    value={autoSyncOptions.verseCount}
                    onChange={(e) =>
                      setAutoSyncOptions((prev) => ({
                        ...prev,
                        verseCount: Number(e.target.value),
                      }))
                    }
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                </div>

                {/* Minimum Interval Between Verses */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
                    <span>MINIMUM VERSE SPACING</span>
                    <span className="text-sky-300 font-bold">{autoSyncOptions.minIntervalSeconds}s</span>
                  </div>
                  <input
                    type="range"
                    min={3}
                    max={12}
                    value={autoSyncOptions.minIntervalSeconds}
                    onChange={(e) =>
                      setAutoSyncOptions((prev) => ({
                        ...prev,
                        minIntervalSeconds: Number(e.target.value),
                      }))
                    }
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                  />
                </div>

                {/* Frequency Band Selector */}
                <div>
                  <span className="text-[10px] text-neutral-400 block mb-1">AUDIO FOCUS BAND</span>
                  <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                    {(['vocal', 'bass', 'all'] as const).map((band) => (
                      <button
                        key={band}
                        onClick={() => {
                          playKeyClick();
                          setAutoSyncOptions((prev) => ({ ...prev, frequencyBand: band }));
                        }}
                        className={`py-1.5 rounded-lg border uppercase transition-colors ${
                          autoSyncOptions.frequencyBand === band
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200 font-bold'
                            : 'bg-white/[0.04] border-white/[0.08] text-neutral-400 hover:text-white'
                        }`}
                      >
                        {band === 'vocal' ? 'VOCAL (MID)' : band === 'bass' ? 'BASS / BEAT' : 'FULL SPECTRUM'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Suggested Peak Table & 1-Click Apply */}
            <div className="md:col-span-7 flex flex-col p-4 sm:p-5 overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-white/[0.08]">
                <div>
                  <div className="text-xs font-mono font-bold text-neutral-100 flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>DETECTED FREQUENCY PEAKS ({suggestedPeaks.length} CANDIDATES)</span>
                  </div>
                  <p className="text-[10px] font-mono text-neutral-400">
                    Calculated via Web Audio onset flux &amp; musical cadence analysis
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSnapExistingToPeaks}
                    className="px-2.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-neutral-200 text-xs font-mono transition-colors"
                    title="Snap existing markers to nearest detected audio peaks"
                  >
                    SNAP EXISTING (±3s)
                  </button>
                  <button
                    onClick={handleApplyAllPeaksToLyrics}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.4)] active:scale-95 transition-all"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>APPLY ALL TO LYRICS</span>
                  </button>
                </div>
              </div>

              {/* Scrollable Peaks Table */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-white/10">
                {suggestedPeaks.length === 0 ? (
                  <div className="py-16 text-center text-neutral-500 font-mono text-xs">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-50 text-emerald-400" />
                    <p>No audio peaks generated yet.</p>
                    <p className="mt-1 text-[11px]">Adjust sensitivity or click "RE-SCAN" on the left.</p>
                  </div>
                ) : (
                  suggestedPeaks.map((peak, pIdx) => {
                    const matchedLyric = lines[pIdx];

                    return (
                      <div
                        key={peak.id || pIdx}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-black/40 hover:bg-black/60 border border-white/[0.08] transition-all group"
                      >
                        {/* Peak Badge & Time */}
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-mono text-xs font-bold">
                            P{pIdx + 1}
                          </span>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono text-rose-300 font-bold">
                                {peak.formattedTime}
                              </span>
                              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 px-1.5 py-0.2 rounded border border-emerald-500/30">
                                {peak.confidence}% Confidence
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-neutral-400 block truncate max-w-[200px] sm:max-w-xs">
                              {peak.description}
                            </span>
                          </div>
                        </div>

                        {/* Matched Lyric Preview */}
                        <div className="flex-1 min-w-0 px-2 hidden sm:block">
                          {matchedLyric ? (
                            <span className="text-xs font-bengali text-neutral-200 truncate block">
                              Verse #{pIdx + 1}: "{matchedLyric.text}"
                            </span>
                          ) : (
                            <span className="text-[11px] font-mono text-neutral-500 italic block">
                              (Unassigned verse slot)
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5">
                          {/* Audition audio at this peak */}
                          {onSeek && (
                            <button
                              onClick={() => {
                                playKeyClick();
                                onSeek(peak.time);
                              }}
                              className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-emerald-500/20 text-neutral-300 hover:text-emerald-300 border border-white/[0.08]"
                              title={`Audition audio at ${peak.formattedTime}`}
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                            </button>
                          )}

                          {/* Add peak as marker */}
                          <button
                            onClick={() => handleAddPeakAsLine(peak)}
                            className="px-2 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono flex items-center gap-1 transition-colors"
                            title="Add as explicit marker"
                          >
                            <Plus className="w-3 h-3" />
                            <span className="hidden sm:inline">INSERT</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom Quick-Sync Footer Banner */}
              <div className="mt-3 p-3 rounded-xl bg-emerald-950/25 border border-emerald-500/30 flex items-center justify-between">
                <span className="text-[11px] font-mono text-emerald-300">
                  Ready to finalize? 1-Click will map all {Math.min(lines.length, suggestedPeaks.length)} verses directly.
                </span>
                <button
                  onClick={handleApplyAllPeaksToLyrics}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>APPLY NOW</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: JSON Map View & Direct Exporter */}
        {activeTab === 'json' && (
          <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-hidden bg-black/40">
            <div className="flex items-center justify-between mb-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <FileJson className="w-4 h-4 text-rose-400" />
                <span className="font-bold text-neutral-200 uppercase">
                  EXPORTED JSON TIMING MAP (LOCALSTORAGE MIRROR)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-neutral-200 text-xs font-mono flex items-center gap-1.5 transition-colors">
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  <span>IMPORT JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={handleDownloadJSON}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-neutral-200 text-xs font-mono flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-sky-400" />
                  <span>DOWNLOAD .JSON</span>
                </button>
                <button
                  onClick={handleCopyJSON}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedToast ? 'COPIED TO CLIPBOARD!' : 'COPY JSON MAP'}</span>
                </button>
              </div>
            </div>

            {/* Syntax preview box */}
            <div className="flex-1 overflow-auto bg-black/80 border border-white/[0.1] rounded-xl p-4 font-mono text-xs text-rose-200/90 leading-relaxed scrollbar-thin scrollbar-thumb-white/10">
              <pre>{currentTrack ? exportTrackLyricsAsJSON(currentTrack.id, currentTrack) : '{}'}</pre>
            </div>
          </div>
        )}

        {/* Footer Bar */}
        <div className="px-4 sm:px-6 py-3 bg-black/60 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono">
          <button
            onClick={handleResetToDefault}
            className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-neutral-400 hover:text-neutral-200 text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>REVERT TO STATIC DEFAULT</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-neutral-400 hidden sm:inline">
              {lines.length} TIMED MARKERS • {suggestedPeaks.length} PEAKS DETECTED • REALTIME SYNC ACTIVE
            </span>
            <button
              onClick={() => {
                playKeyClick();
                onClose();
              }}
              className="px-4 py-1.5 rounded-xl bg-white/[0.1] hover:bg-white/[0.18] text-white font-mono text-xs font-semibold transition-all"
            >
              DONE &amp; CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
