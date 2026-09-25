export type MusicCategory = 'FEATURED' | 'PUNJABI' | 'BENGALI';

export interface PlaylistTrack {
  id: string;
  title: string;
  artist: string;
  duration: string; // e.g. "3:42"
  durationSeconds: number;
}

export interface Playlist {
  id: string;
  category: MusicCategory;
  name: string;
  subtitle: string;
  url: string;
  listId: string;
  tracks: PlaylistTrack[];
}

export interface RoyaltyFreeTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  mood: string;
  instruments: string[];
  duration: string;
  source: string; // e.g. "Free Music Archive", "Internet Archive", "Musopen (CC0)"
  license: 'CC0' | 'Creative Commons' | 'Royalty-Free' | 'Commercial Use';
  licenseDetails: string;
  attributionRequirement: string;
  previewUrl: string;
  licenseUrl: string;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: number;
  resultCount: number;
  results: RoyaltyFreeTrack[];
}

export type BackgroundPresetId =
  | 'street'
  | 'street-chai'
  | 'rainy-cafe'
  | 'golden-office'
  | 'midnight-lan'
  | 'cyber'
  | 'minimal'
  | 'custom';

export interface BackgroundVisualSettings {
  lighting: string;
  colorGrade: string;
  crtGlow: string;
  vignetteStyle: string;
  themeAura: string;
}

export interface BackgroundPreset {
  id: BackgroundPresetId;
  name: string;
  tagline: string;
  description: string;
  moodColor: string;
  accentBorder: string;
  defaultDimming: number;
  defaultBlur: number;
  badge: string;
  visualSettings: BackgroundVisualSettings;
}
