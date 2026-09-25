import rawTimingData from '../data/lyricsTiming.json';
import { PlaylistTrack } from '../types';
import { SONG_LYRICS, NOSTALGIC_BENGALI_POETRY } from '../data/songLyrics';

export interface TimedLyricLine {
  time: number; // in seconds
  text: string;
  hint?: string;
}

export interface TrackTimingMapEntry {
  title: string;
  artist: string;
  durationSeconds?: number;
  lyrics: TimedLyricLine[];
  updatedAt?: string;
}

interface RawTrackTiming {
  title: string;
  artist: string;
  lyrics: Array<{ time: number; text: string; hint?: string }>;
}

const STATIC_TIMING_MAP = rawTimingData as Record<string, RawTrackTiming>;
const LOCAL_STORAGE_PREFIX = 'aiearnx_custom_lyrics_';
const MASTER_MAP_KEY = 'aiearnx_all_lyrics_timing_map';

/**
 * Retrieves the full master JSON timing map saved in localStorage.
 */
export function getAllCustomLyricsMap(): Record<string, TrackTimingMapEntry> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(MASTER_MAP_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.warn('Failed to parse master lyrics map from localStorage:', err);
    return {};
  }
}

/**
 * Retrieves user-customized timing data from localStorage for a specific track.
 */
export function getCustomTrackLyrics(trackId: string): TimedLyricLine[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${trackId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.sort((a, b) => a.time - b.time);
    }
  } catch (err) {
    console.warn('Failed to parse custom lyrics from localStorage:', err);
  }
  return null;
}

/**
 * Saves customized timed lyrics into localStorage, automatically updates
 * the master JSON map, and notifies active listeners.
 */
export function saveCustomTrackLyrics(
  trackId: string, 
  lyrics: TimedLyricLine[],
  trackMeta?: { title?: string; artist?: string; durationSeconds?: number }
): void {
  if (typeof window === 'undefined') return;
  try {
    const sorted = [...lyrics].sort((a, b) => a.time - b.time);
    // 1. Save track-specific entry
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${trackId}`, JSON.stringify(sorted));

    // 2. Automatically update master JSON map
    const masterMap = getAllCustomLyricsMap();
    masterMap[trackId] = {
      title: trackMeta?.title || masterMap[trackId]?.title || trackId,
      artist: trackMeta?.artist || masterMap[trackId]?.artist || 'Unknown Artist',
      durationSeconds: trackMeta?.durationSeconds || masterMap[trackId]?.durationSeconds,
      lyrics: sorted,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(MASTER_MAP_KEY, JSON.stringify(masterMap, null, 2));

    // 3. Dispatch custom event so FloatingLyricsOverlay & HeroCenter update instantly
    window.dispatchEvent(
      new CustomEvent('aiearnx-lyrics-updated', {
        detail: { trackId, lyrics: sorted },
      })
    );
  } catch (err) {
    console.error('Failed to save custom lyrics to localStorage:', err);
  }
}

/**
 * Removes custom lyrics from localStorage, reverting to static JSON defaults.
 */
export function deleteCustomTrackLyrics(trackId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}${trackId}`);
    const masterMap = getAllCustomLyricsMap();
    if (masterMap[trackId]) {
      delete masterMap[trackId];
      localStorage.setItem(MASTER_MAP_KEY, JSON.stringify(masterMap, null, 2));
    }
    window.dispatchEvent(
      new CustomEvent('aiearnx-lyrics-updated', {
        detail: { trackId, lyrics: null },
      })
    );
  } catch (err) {
    console.error('Failed to delete custom lyrics from localStorage:', err);
  }
}

/**
 * Generates an exportable JSON string for a given track's lyrics.
 */
export function exportTrackLyricsAsJSON(trackId: string, track?: PlaylistTrack | null): string {
  const lyrics = getTimedLyricsForTrack(track);
  const data: TrackTimingMapEntry = {
    title: track?.title || trackId,
    artist: track?.artist || '',
    durationSeconds: track?.durationSeconds,
    lyrics,
    updatedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}

/**
 * Imports a JSON map or array of timed lyrics for a track into localStorage.
 */
export function importTrackLyricsFromJSON(trackId: string, jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    let lines: TimedLyricLine[] = [];
    let title: string | undefined;
    let artist: string | undefined;

    if (Array.isArray(parsed)) {
      lines = parsed;
    } else if (parsed && Array.isArray(parsed.lyrics)) {
      lines = parsed.lyrics;
      title = parsed.title;
      artist = parsed.artist;
    } else {
      return false;
    }

    if (lines.length > 0) {
      saveCustomTrackLyrics(trackId, lines, { title, artist });
      return true;
    }
  } catch (e) {
    console.error('Import lyric JSON failed:', e);
  }
  return false;
}

/**
 * Returns customized localStorage timing, static JSON timing data,
 * or synthesizes time-stamped lyrics proportionally across the track's duration.
 */
export function getTimedLyricsForTrack(track?: PlaylistTrack | null): TimedLyricLine[] {
  if (!track) {
    return NOSTALGIC_BENGALI_POETRY.map((text, idx) => ({
      time: idx * 8,
      text,
      hint: 'নস্টালজিক বাংলা সুর',
    }));
  }

  // 1. Check user custom manual timestamps in localStorage first
  const custom = getCustomTrackLyrics(track.id);
  if (custom && custom.length > 0) {
    return custom;
  }

  // 2. Direct ID match from static JSON
  if (STATIC_TIMING_MAP[track.id]) {
    return STATIC_TIMING_MAP[track.id].lyrics;
  }

  // 3. Keyword/Title matching against static JSON
  const lowerTitle = (track.title || '').toLowerCase();
  for (const [key, data] of Object.entries(STATIC_TIMING_MAP)) {
    if (lowerTitle.includes(data.title.toLowerCase()) || lowerTitle.includes(key)) {
      return data.lyrics;
    }
  }

  // 4. Fallback: synthesize proportional timestamps from SONG_LYRICS or universal poetry
  const lines = SONG_LYRICS[track.id] || NOSTALGIC_BENGALI_POETRY;
  const totalDuration = track.durationSeconds && track.durationSeconds > 0 ? track.durationSeconds : 240;
  const interval = Math.max(6, Math.floor(totalDuration / lines.length));

  return lines.map((text, idx) => ({
    time: idx * interval,
    text,
    hint: `${track.title} • ${track.artist}`,
  }));
}

/**
 * Given the current playback time, finds the active timed lyric line
 * and its sequence index.
 */
export function getCurrentSyncedLyric(
  track?: PlaylistTrack | null,
  currentTime = 0
): {
  activeLine: TimedLyricLine;
  index: number;
  nextLine?: TimedLyricLine;
  allLines: TimedLyricLine[];
} {
  const allLines = getTimedLyricsForTrack(track);

  if (allLines.length === 0) {
    const fallback: TimedLyricLine = {
      time: 0,
      text: 'মনের কথা সুর হয়ে ছুঁয়ে যায় মন...',
      hint: 'মনের কথা',
    };
    return { activeLine: fallback, index: 0, allLines: [fallback] };
  }

  // Find line where line.time <= currentTime < nextLine.time
  let matchedIndex = 0;
  for (let i = 0; i < allLines.length; i++) {
    if (currentTime >= allLines[i].time) {
      matchedIndex = i;
    } else {
      break;
    }
  }

  const activeLine = allLines[matchedIndex];
  const nextLine = allLines[matchedIndex + 1];

  return {
    activeLine,
    index: matchedIndex,
    nextLine,
    allLines,
  };
}
