import React from 'react';
import defaultSareeTramBg from '../assets/bengali_saree_tram_bg.svg';
import streetChaiBg from '../assets/cyber_cafe_bg.svg';
import { BackgroundPresetId } from '../types';
import { CyberScenery } from './CyberScenery';

interface BackgroundLayerProps {
  bgType: BackgroundPresetId;
  customBgDataUrl: string | null;
  dimming: number; // 10 to 85%
  blur: number; // 0 to 16px
  isCrtEnabled: boolean;
}

export const BackgroundLayer: React.FC<BackgroundLayerProps> = ({
  bgType,
  customBgDataUrl,
  dimming,
  blur,
  isCrtEnabled,
}) => {
  const overlayOpacity = dimming / 100;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none">
      {/* 1. Base Image Layer (Default: Bengali Saree & Heritage Tram) */}
      {bgType === 'street' && (
        <img
          src={defaultSareeTramBg}
          alt="বাঙালি শাড়ি ও ট্রাম (Default Wallpaper)"
          className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out"
          style={{
            filter: `blur(${blur}px) saturate(1.15) contrast(1.05)`,
            transform: blur > 0 ? 'scale(1.04)' : 'scale(1)',
          }}
        />
      )}

      {/* Street Chai & Red Chair */}
      {bgType === 'street-chai' && (
        <img
          src={streetChaiBg}
          alt="Street Chai & Red Chair"
          className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out"
          style={{
            filter: `blur(${blur}px) saturate(1.18) contrast(1.06)`,
            transform: blur > 0 ? 'scale(1.04)' : 'scale(1)',
          }}
        />
      )}

      {bgType === 'custom' && customBgDataUrl && (
        <img
          src={customBgDataUrl}
          alt="Custom User Wallpaper"
          className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out"
          style={{
            filter: `blur(${blur}px) saturate(1.15) contrast(1.05)`,
            transform: blur > 0 ? 'scale(1.04)' : 'scale(1)',
          }}
        />
      )}

      {/* 2. Curated Themed Presets (Rainy Cafe, Golden Hour Office, Midnight LAN) */}
      {(bgType === 'rainy-cafe' || bgType === 'golden-office' || bgType === 'midnight-lan') && (
        <div
          className="absolute inset-0 transition-all duration-700 ease-out"
          style={{
            filter: `blur(${blur}px)`,
            transform: blur > 0 ? 'scale(1.03)' : 'scale(1)',
          }}
        >
          <CyberScenery presetId={bgType} />
        </div>
      )}

      {/* 3. Cyber Cabin Glowing Phosphor Background */}
      {bgType === 'cyber' && (
        <div className="absolute inset-0 bg-[#060a12] flex items-center justify-center">
          <div className="w-[85vw] h-[65vh] rounded-[50px] bg-gradient-to-b from-cyan-900/30 via-sky-950/20 to-transparent blur-3xl animate-pulse" />
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage: 'radial-gradient(rgba(34, 211, 238, 0.2) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
        </div>
      )}

      {/* 4. Minimal Dark Nocturne Background */}
      {bgType === 'minimal' && (
        <div
          className="absolute inset-0 bg-[#07090e] opacity-30"
          style={{
            backgroundImage: `radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1px)`,
            backgroundSize: '36px 36px',
          }}
        />
      )}

      {/* 5. Preset-Specific Atmospheric Tint & Lighting Gradients */}
      {bgType === 'rainy-cafe' && (
        <div className="absolute inset-0 bg-gradient-to-b from-sky-950/25 via-transparent to-blue-950/30 pointer-events-none mix-blend-screen" />
      )}

      {bgType === 'golden-office' && (
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-950/20 via-transparent to-orange-950/25 pointer-events-none mix-blend-screen" />
      )}

      {bgType === 'midnight-lan' && (
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/15 via-transparent to-cyan-950/20 pointer-events-none mix-blend-screen" />
      )}

      {bgType === 'street' && (
        <div className="absolute inset-0 bg-gradient-to-b from-rose-950/10 via-transparent to-amber-950/15 pointer-events-none mix-blend-screen" />
      )}

      {bgType === 'cyber' && (
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/20 via-transparent to-sky-950/30 pointer-events-none mix-blend-screen" />
      )}

      {/* 6. Adaptive Darkness & Contrast Gradient Overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#07090e]/90 via-black/50 to-[#07090e]/95 transition-opacity duration-300"
        style={{
          opacity: overlayOpacity,
        }}
      />

      {/* 7. Additional Radial Vignette for Center Text Focus */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, transparent 40%, rgba(7, 9, 14, 0.75) 100%)',
        }}
      />

      {/* 8. CRT Scanline Layer (if enabled) */}
      {isCrtEnabled && <div className="crt-overlay absolute inset-0 z-10 opacity-55" />}

      {/* 9. CRT Corner Vignette */}
      <div className="crt-vignette absolute inset-0 z-20" />
    </div>
  );
};
