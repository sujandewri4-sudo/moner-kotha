import React, { useEffect } from 'react';
import { X, CheckCircle2, Wifi, WifiOff, HardDrive } from 'lucide-react';
import { playKeyClick } from '../utils/cyberCafeAmbience';

interface OfflineModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOnline: boolean;
}

export const OfflineModal: React.FC<OfflineModalProps> = ({
  isOpen,
  onClose,
  isOnline,
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-2xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm rounded-3xl bg-[#080d18]/92 backdrop-blur-2xl border border-white/[0.12] shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15),0_25px_60px_rgba(0,0,0,0.95)] p-6 text-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-sky-400" />
            <h3 className="font-['Cinzel',serif] tracking-wider text-sm font-semibold bg-gradient-to-r from-white via-neutral-100 to-neutral-300 bg-clip-text text-transparent">
              OFFLINE MODE
            </h3>
          </div>
          <button
            onClick={() => {
              playKeyClick();
              onClose();
            }}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 active:scale-95 transition border border-transparent hover:border-white/10"
            aria-label="Close offline mode popup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Badge */}
        <div className="mt-4 flex items-center gap-2.5 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
          {isOnline ? (
            <>
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </div>
              <Wifi className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono text-emerald-400 font-semibold tracking-wider">
                STATUS: ONLINE
              </span>
            </>
          ) : (
            <>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              <WifiOff className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono text-amber-400 font-semibold tracking-wider">
                STATUS: OFFLINE
              </span>
            </>
          )}
        </div>

        {/* Feature Checkpoints */}
        <div className="mt-4 space-y-2.5 text-xs font-mono">
          <div className="flex items-center gap-2.5 text-neutral-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Website cached</span>
          </div>
          <div className="flex items-center gap-2.5 text-neutral-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>UI available offline</span>
          </div>
          <div className="flex items-center gap-2.5 text-neutral-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Music metadata cached</span>
          </div>
        </div>

        {/* Descriptive Notice */}
        <p className="mt-4 text-xs text-neutral-400 italic bg-black/40 p-3 rounded-xl border border-white/[0.06] shadow-inner">
          "Internet is required for online music and search."
        </p>

        {/* Close Button */}
        <div className="mt-5 pt-3 border-t border-white/[0.08] flex justify-end">
          <button
            onClick={() => {
              playKeyClick();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] active:scale-95 text-xs font-mono text-white transition-all border border-white/[0.12] hover:border-white/25 tracking-wider shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_4px_16px_rgba(0,0,0,0.4)]"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
