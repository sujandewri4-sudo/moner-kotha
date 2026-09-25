import React from 'react';
import { X, ShieldCheck, Copy, Check, ExternalLink } from 'lucide-react';
import { RoyaltyFreeTrack } from '../types';
import { playKeyClick } from '../utils/cyberCafeAmbience';

interface LicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: RoyaltyFreeTrack | null;
}

export const LicenseModal: React.FC<LicenseModalProps> = ({ isOpen, onClose, track }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !track) return null;

  const handleCopyAttribution = () => {
    playKeyClick();
    if (track.attributionRequirement) {
      navigator.clipboard.writeText(track.attributionRequirement);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg rounded-3xl bg-[#0a0e18] border border-white/10 shadow-2xl p-6 text-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-['Cinzel',serif] tracking-wider text-base font-semibold text-neutral-100">
              LICENSE & ATTRIBUTION
            </h3>
          </div>
          <button
            onClick={() => {
              playKeyClick();
              onClose();
            }}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition"
            aria-label="Close license details modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs font-mono">
          <div>
            <span className="text-neutral-500 uppercase tracking-widest text-[10px] block">
              Track Title & Artist
            </span>
            <p className="text-sm font-sans font-semibold text-neutral-100 mt-0.5">
              {track.title}
            </p>
            <p className="text-neutral-400 font-sans">{track.artist}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-neutral-500 uppercase tracking-widest text-[10px] block">
                Catalog Source
              </span>
              <p className="text-neutral-200 mt-0.5 font-sans font-medium">{track.source}</p>
            </div>
            <div>
              <span className="text-neutral-500 uppercase tracking-widest text-[10px] block">
                License Classification
              </span>
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 text-[11px] font-semibold">
                {track.license}
              </span>
            </div>
          </div>

          <div>
            <span className="text-neutral-500 uppercase tracking-widest text-[10px] block">
              Terms & Permissions
            </span>
            <p className="text-neutral-300 font-sans text-xs mt-1 leading-relaxed bg-black/40 p-3 rounded-xl border border-white/5">
              {track.licenseDetails}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-500 uppercase tracking-widest text-[10px] block">
                Attribution Requirement
              </span>
              <button
                onClick={handleCopyAttribution}
                className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 transition"
                aria-label="Copy attribution text"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Credit'}</span>
              </button>
            </div>
            <div className="mt-1 p-3 rounded-xl bg-white/[0.03] border border-white/10 text-neutral-300 text-xs font-sans">
              {track.attributionRequirement}
            </div>
          </div>

          {track.licenseUrl && (
            <div className="pt-1">
              <a
                href={track.licenseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] text-neutral-400 hover:text-white transition underline"
              >
                <span>Read Full Official Legal Deed</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={() => {
              playKeyClick();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono text-white transition"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
