import { useState, useEffect, useRef, useCallback } from 'react';
import { Playlist, PlaylistTrack } from '../types';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface UseYouTubeAudioProps {
  currentPlaylist: Playlist;
  isOnline: boolean;
}

export function useYouTubeAudio({ currentPlaylist, isOnline }: UseYouTubeAudioProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTrack, setCurrentTrack] = useState<PlaylistTrack>(() => currentPlaylist.tracks[0]);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isYTReady, setIsYTReady] = useState(false);

  const playerRef = useRef<any>(null);
  const timerRef = useRef<number | null>(null);
  const isSeekingRef = useRef(false);

  // Sync current track when playlist or track index changes
  useEffect(() => {
    const track = currentPlaylist.tracks[currentTrackIndex] || currentPlaylist.tracks[0];
    setCurrentTrack(track);
    if (track && track.durationSeconds) {
      setDuration(track.durationSeconds);
    }
  }, [currentPlaylist, currentTrackIndex]);

  // Load YouTube IFrame API script once
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.YT && window.YT.Player) {
      setIsYTReady(true);
      return;
    }

    const prevReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prevReady) prevReady();
      setIsYTReady(true);
    };

    if (!document.getElementById('yt-iframe-api-script')) {
      const tag = document.createElement('script');
      tag.id = 'yt-iframe-api-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      document.body.appendChild(tag);
    }
  }, []);

  // Initialize YT.Player
  useEffect(() => {
    if (!isYTReady || !isOnline) return;

    const container = document.getElementById('aiearnx-hidden-yt-iframe');
    if (!container) return;

    try {
      if (playerRef.current) {
        playerRef.current.destroy();
      }

      playerRef.current = new window.YT.Player('aiearnx-hidden-yt-iframe', {
        height: '1',
        width: '1',
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          modestbranding: 1,
          origin: window.location.origin,
          listType: 'playlist',
          list: currentPlaylist.listId,
        },
        events: {
          onReady: (event: any) => {
            try {
              event.target.setVolume(volume);
              if (isMuted) event.target.mute();
            } catch {
              // ignore
            }
          },
          onStateChange: (event: any) => {
            const state = event.data;
            // 1 = PLAYING, 2 = PAUSED, 0 = ENDED, 3 = BUFFERING
            if (state === 1) {
              setIsPlaying(true);
              setIsBuffering(false);
              try {
                const vidData = event.target.getVideoData();
                if (vidData && vidData.title) {
                  // If YouTube provides real-time title
                  setCurrentTrack((prev) => ({
                    ...prev,
                    title: vidData.title.replace(/\s*\(Official Video\).*/i, '').replace(/\[.*\]/g, ''),
                    artist: vidData.author || prev.artist,
                  }));
                }
                const d = event.target.getDuration();
                if (d && d > 0) setDuration(d);
              } catch {
                // ignore
              }
            } else if (state === 2) {
              setIsPlaying(false);
              setIsBuffering(false);
            } else if (state === 3) {
              setIsBuffering(true);
            } else if (state === 0) {
              // Video ended -> go to next track
              handleNext();
            }
          },
          onError: () => {
            setIsBuffering(false);
          },
        },
      });
    } catch (err) {
      console.warn('YT Player init notice:', err);
    }

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // ignore
        }
        playerRef.current = null;
      }
    };
  }, [isYTReady, currentPlaylist.id, isOnline]);

  // Polling for playback time
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        if (isSeekingRef.current) return;

        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          try {
            const cur = playerRef.current.getCurrentTime();
            const dur = playerRef.current.getDuration();
            if (typeof cur === 'number' && !isNaN(cur)) {
              setCurrentTime(cur);
            }
            if (typeof dur === 'number' && dur > 0 && !isNaN(dur)) {
              setDuration(dur);
            }
          } catch {
            // fallback timer
            setCurrentTime((t) => (t + 0.5 > duration ? 0 : t + 0.5));
          }
        } else {
          // Fallback simulation when offline or external API not mounted
          setCurrentTime((t) => {
            const next = t + 0.5;
            if (next >= duration) {
              return 0;
            }
            return next;
          });
        }
      }, 500);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, duration]);

  // Play / Pause
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
        try {
          playerRef.current.pauseVideo();
        } catch {
          // ignore
        }
      }
      setIsPlaying(false);
    } else {
      if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
        try {
          playerRef.current.playVideo();
        } catch {
          // ignore
        }
      }
      setIsPlaying(true);
    }
  }, [isPlaying]);

  // Next Track
  const handleNext = useCallback(() => {
    const nextIdx = (currentTrackIndex + 1) % currentPlaylist.tracks.length;
    setCurrentTrackIndex(nextIdx);
    setCurrentTime(0);

    if (playerRef.current && typeof playerRef.current.nextVideo === 'function') {
      try {
        playerRef.current.nextVideo();
        playerRef.current.playVideo();
      } catch {
        // ignore
      }
    }
  }, [currentTrackIndex, currentPlaylist.tracks.length]);

  // Previous Track
  const handlePrev = useCallback(() => {
    if (currentTime > 4) {
      // If played more than 4 seconds, restart track
      seekTo(0);
      return;
    }
    const prevIdx = (currentTrackIndex - 1 + currentPlaylist.tracks.length) % currentPlaylist.tracks.length;
    setCurrentTrackIndex(prevIdx);
    setCurrentTime(0);

    if (playerRef.current && typeof playerRef.current.previousVideo === 'function') {
      try {
        playerRef.current.previousVideo();
        playerRef.current.playVideo();
      } catch {
        // ignore
      }
    }
  }, [currentTime, currentTrackIndex, currentPlaylist.tracks.length]);

  // Seek
  const seekTo = useCallback((seconds: number) => {
    setCurrentTime(seconds);
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      try {
        playerRef.current.seekTo(seconds, true);
      } catch {
        // ignore
      }
    }
  }, []);

  // Rewind 10s
  const handleRewind = useCallback(() => {
    const target = Math.max(0, currentTime - 10);
    seekTo(target);
  }, [currentTime, seekTo]);

  // Fast forward 10s
  const handleForward = useCallback(() => {
    const target = Math.min(duration, currentTime + 10);
    seekTo(target);
  }, [currentTime, duration, seekTo]);

  // Volume
  const handleVolumeChange = useCallback((newVol: number) => {
    setVolume(newVol);
    if (newVol === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
    if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
      try {
        playerRef.current.setVolume(newVol);
      } catch {
        // ignore
      }
    }
  }, [isMuted]);

  // Toggle Mute
  const toggleMute = useCallback(() => {
    if (isMuted) {
      setIsMuted(false);
      if (playerRef.current && typeof playerRef.current.unMute === 'function') {
        try {
          playerRef.current.unMute();
        } catch {
          // ignore
        }
      }
    } else {
      setIsMuted(true);
      if (playerRef.current && typeof playerRef.current.mute === 'function') {
        try {
          playerRef.current.mute();
        } catch {
          // ignore
        }
      }
    }
  }, [isMuted]);

  return {
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
  };
}
