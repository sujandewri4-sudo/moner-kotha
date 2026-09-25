import React, { useRef, useEffect } from 'react';
import { 
  X, 
  Image as ImageIcon, 
  Upload, 
  Check, 
  Sliders, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Shuffle, 
  Sparkles,
  SunMedium,
  Monitor,
  Eye,
  Palette,
  CloudRain
} from 'lucide-react';
import { BackgroundPresetId, BackgroundPreset } from '../types';
import { BACKGROUND_PRESETS } from '../data/backgroundPresets';
import { playKeyClick } from '../utils/cyberCafeAmbience';

interface BackgroundSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBgType: BackgroundPresetId;
  onSelectBgType: (type: BackgroundPresetId) => void;
  customBgDataUrl: string | null;
  onUploadCustomBg: (dataUrl: string) => void;
  dimming: number;
  onDimmingChange: (val: number) => void;
  blur: number;
  onBlurChange: (val: number) => void;
  onResetDefaults: () => void;
}

export const BackgroundSettingsModal: React.FC<BackgroundSettingsModalProps> = ({
  isOpen,
  onClose,
  currentBgType,
  onSelectBgType,
  customBgDataUrl,
  onUploadCustomBg,
  dimming,
  onDimmingChange,
  blur,
  onBlurChange,
  onResetDefaults,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Find index of current preset among curated presets
  const currentPresetIndex = BACKGROUND_PRESETS.findIndex((p) => p.id === currentBgType);
  const activePreset: BackgroundPreset | undefined = 
    currentPresetIndex !== -1 ? BACKGROUND_PRESETS[currentPresetIndex] : undefined;

  // Cycle to Next Preset Environment
  const handleCycleNext = () => {
    playKeyClick();
    const nextIndex = (currentPresetIndex + 1) % BACKGROUND_PRESETS.length;
    const nextPreset = BACKGROUND_PRESETS[nextIndex];
    onSelectBgType(nextPreset.id);
    onDimmingChange(nextPreset.defaultDimming);
    onBlurChange(nextPreset.defaultBlur);
  };

  // Cycle to Previous Preset Environment
  const handleCyclePrev = () => {
    playKeyClick();
    const prevIndex = (currentPresetIndex - 1 + BACKGROUND_PRESETS.length) % BACKGROUND_PRESETS.length;
    const prevPreset = BACKGROUND_PRESETS[prevIndex];
    onSelectBgType(prevPreset.id);
    onDimmingChange(prevPreset.defaultDimming);
    onBlurChange(prevPreset.defaultBlur);
  };

  // Pick a Random / Shuffle Preset Environment
  const handleShufflePreset = () => {
    playKeyClick();
    const available = BACKGROUND_PRESETS.filter((p) => p.id !== currentBgType);
    const random = available[Math.floor(Math.random() * available.length)] || BACKGROUND_PRESETS[0];
    onSelectBgType(random.id);
    onDimmingChange(random.defaultDimming);
    onBlurChange(random.defaultBlur);
  };

  // Apply a specific preset directly
  const handleSelectPreset = (preset: BackgroundPreset) => {
    playKeyClick();
    onSelectBgType(preset.id);
    onDimmingChange(preset.defaultDimming);
    onBlurChange(preset.defaultBlur);
  };

  // Keyboard navigation within modal: Left/Right arrows to cycle presets
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleCycleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleCyclePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentPresetIndex, onClose]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      playKeyClick();
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onUploadCustomBg(event.target.result as string);
          onSelectBgType('custom');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      playKeyClick();
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onUploadCustomBg(event.target.result as string);
          onSelectBgType('custom');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-2xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl rounded-3xl bg-[#080d18]/92 backdrop-blur-2xl border border-white/[0.12] shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15),0_25px_65px_rgba(0,0,0,0.95)] p-5 sm:p-6 text-neutral-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <ImageIcon className="w-4 h-4 text-sky-400" />
            <h3 className="font-['Cinzel',serif] tracking-wider text-sm sm:text-base font-semibold bg-gradient-to-r from-white via-neutral-100 to-neutral-300 bg-clip-text text-transparent">
              BACKGROUND SETTINGS &amp; PRESETS
            </h3>
          </div>
          <button
            onClick={() => {
              playKeyClick();
              onClose();
            }}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 active:scale-95 transition border border-transparent hover:border-white/10"
            aria-label="Close background settings"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="mt-4 space-y-5 overflow-y-auto flex-1 pr-1">

          {/* ======================================================== */}
          {/* SECTION: PRESETS & THEMED ENVIRONMENTS CYCLER           */}
          {/* ======================================================== */}
          <div className="rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/15 p-4 sm:p-5 relative overflow-hidden">
            {/* Top Cycler Badge */}
            <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-2.5">
              <span className="flex items-center gap-1.5 text-sky-400 font-semibold tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>PRESETS: THEMED ENVIRONMENTS</span>
              </span>
              <span className="text-[11px] text-neutral-400">
                {currentPresetIndex !== -1
                  ? `ENVIRONMENT ${currentPresetIndex + 1 < 10 ? `0${currentPresetIndex + 1}` : currentPresetIndex + 1} / 0${BACKGROUND_PRESETS.length}`
                  : 'CUSTOM UPLOAD'}
              </span>
            </div>

            {/* Cycler Interactive Center Navigation Bar */}
            <div className="flex items-center justify-between gap-3 my-3">
              <button
                onClick={handleCyclePrev}
                className="p-3 rounded-xl bg-white/[0.07] hover:bg-white/15 border border-white/10 text-neutral-200 hover:text-white transition flex items-center gap-1 group shadow-sm"
                aria-label="Cycle to previous preset environment (ArrowLeft)"
                title="Previous Preset [Arrow Left]"
              >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition" />
              </button>

              <div className="text-center min-w-0 flex-1 px-2">
                {activePreset ? (
                  <>
                    <div className="flex items-center justify-center gap-2">
                      <h4 className={`text-base sm:text-lg font-bold tracking-wide ${activePreset.moodColor}`}>
                        {activePreset.name}
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 border border-white/10 text-neutral-300">
                        {activePreset.badge}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 font-sans mt-1 line-clamp-1">
                      {activePreset.tagline}
                    </p>
                  </>
                ) : (
                  <>
                    <h4 className="text-base sm:text-lg font-bold text-sky-300">Custom Uploaded Wallpaper</h4>
                    <p className="text-xs text-neutral-400 mt-1">User uploaded custom photo from device</p>
                  </>
                )}
              </div>

              <button
                onClick={handleCycleNext}
                className="p-3 rounded-xl bg-white/[0.07] hover:bg-white/15 border border-white/10 text-neutral-200 hover:text-white transition flex items-center gap-1 group shadow-sm"
                aria-label="Cycle to next preset environment (ArrowRight)"
                title="Next Preset [Arrow Right]"
              >
                <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition" />
              </button>
            </div>

            {/* Mapped Visual Settings Information Box */}
            {activePreset && (
              <div className="mt-3 p-3 rounded-xl bg-black/40 border border-white/10 space-y-2 text-[11px] font-mono">
                <div className="flex items-center justify-between text-neutral-400 border-b border-white/5 pb-1.5">
                  <span className="flex items-center gap-1.5 text-neutral-300">
                    <SunMedium className="w-3.5 h-3.5 text-amber-400" />
                    <span>MAPPED VISUAL ATMOSPHERE</span>
                  </span>
                  <span className="text-neutral-500">
                    Dimming: {activePreset.defaultDimming}% • Blur: {activePreset.defaultBlur}px
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-neutral-400 pt-1">
                  <div className="flex items-start gap-1.5">
                    <CloudRain className="w-3.5 h-3.5 text-sky-400 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-neutral-300 font-normal">Lighting: </strong>
                      {activePreset.visualSettings.lighting}
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-neutral-300 font-normal">Grading: </strong>
                      {activePreset.visualSettings.colorGrade}
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Monitor className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-neutral-300 font-normal">CRT Bloom: </strong>
                      {activePreset.visualSettings.crtGlow}
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-neutral-300 font-normal">Focus Vignette: </strong>
                      {activePreset.visualSettings.vignetteStyle}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Cycle Action Buttons */}
            <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
              <button
                onClick={handleCycleNext}
                className="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-neutral-950 font-bold flex items-center gap-1.5 transition shadow-[0_0_15px_rgba(56,189,248,0.25)]"
                aria-label="Cycle to next background preset environment"
              >
                <span>CYCLE NEXT ENVIRONMENT</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleShufflePreset}
                className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/15 text-neutral-300 hover:text-white flex items-center gap-1.5 transition border border-white/10"
                aria-label="Shuffle random preset"
              >
                <Shuffle className="w-3.5 h-3.5 text-amber-400" />
                <span>SHUFFLE PRESET</span>
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION: ALL PRESETS TILES (GRID)                        */}
          {/* ======================================================== */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                Preset Environments Gallery ({BACKGROUND_PRESETS.length})
              </span>
              <span className="text-[10px] font-mono text-neutral-500">
                CLICK TO ACTIVATE VISUAL PROFILE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {BACKGROUND_PRESETS.map((preset) => {
                const isSelected = currentBgType === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 relative active:scale-[0.985] ${
                      isSelected
                        ? 'bg-white/10 border-sky-400/80 shadow-[inset_0_1px_0_0_rgba(56,189,248,0.3),0_0_24px_rgba(56,189,248,0.2)]'
                        : 'bg-white/[0.025] border-white/[0.07] hover:bg-white/[0.06] hover:border-white/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
                    }`}
                    aria-label={`Select preset ${preset.name}`}
                  >
                    <div>
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-xs font-bold tracking-wide ${isSelected ? preset.moodColor : 'text-neutral-100'}`}>
                          {preset.name}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-sky-400 flex-shrink-0" />}
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400 block mt-1 line-clamp-2">
                        {preset.tagline}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[9px] font-mono text-neutral-500 pt-2 border-t border-white/5">
                      <span className="uppercase">{preset.badge}</span>
                      <span>MAPPED PROFILE</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION: CUSTOM IMAGE UPLOAD                             */}
          {/* ======================================================== */}
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block mb-2">
              Custom Wallpaper / Image
            </span>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/15 hover:border-white/30 rounded-2xl p-4 text-center cursor-pointer transition bg-white/[0.02] hover:bg-white/[0.05] group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-1.5">
                <div className="p-2 rounded-full bg-white/5 text-neutral-300 group-hover:text-white transition">
                  <Upload className="w-4 h-4 text-sky-400" />
                </div>
                <p className="text-xs font-medium text-neutral-200">
                  Click to browse or drag &amp; drop custom image
                </p>
                <p className="text-[10px] text-neutral-500 font-mono">
                  Saved automatically in your browser's local cache
                </p>
              </div>
            </div>

            {customBgDataUrl && (
              <div className="mt-2 flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono">
                <span className="text-neutral-300 truncate max-w-[200px]">
                  Custom image loaded
                </span>
                <button
                  onClick={() => {
                    playKeyClick();
                    onSelectBgType('custom');
                  }}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition ${
                    currentBgType === 'custom'
                      ? 'bg-sky-500 text-black'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {currentBgType === 'custom' ? 'ACTIVE' : 'USE THIS'}
                </button>
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* SECTION: FINE-TUNE VISUAL SETTINGS (DIMMING & BLUR)      */}
          {/* ======================================================== */}
          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-3.5">
            <div className="flex items-center justify-between text-xs font-mono text-neutral-300">
              <div className="flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-neutral-400" />
                <span>FINE-TUNE VISIBILITY &amp; SOFTNESS</span>
              </div>
              <span className="text-[10px] text-neutral-500">ARROW KEYS CYCLE PRESETS</span>
            </div>

            {/* Darkness Slider */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mb-1">
                <span>Overlay Dimming</span>
                <span>{dimming}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="85"
                value={dimming}
                onChange={(e) => onDimmingChange(Number(e.target.value))}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
            </div>

            {/* Blur Slider */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mb-1">
                <span>Background Softness (Blur)</span>
                <span>{blur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="16"
                value={blur}
                onChange={(e) => onBlurChange(Number(e.target.value))}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3.5 border-t border-white/[0.08] flex items-center justify-between">
          <button
            onClick={() => {
              playKeyClick();
              onResetDefaults();
            }}
            className="flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-white transition-colors active:scale-95 px-2 py-1 rounded-lg hover:bg-white/[0.04]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET DEFAULTS</span>
          </button>

          <button
            onClick={() => {
              playKeyClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] active:scale-95 text-xs font-mono text-white transition-all border border-white/[0.12] hover:border-white/25 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_4px_16px_rgba(0,0,0,0.4)]"
          >
            APPLY &amp; CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
