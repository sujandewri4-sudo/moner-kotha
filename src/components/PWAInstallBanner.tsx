import React, { useState } from 'react';
import { Download, RefreshCw, Smartphone, X } from 'lucide-react';
import { playKeyClick } from '../utils/cyberCafeAmbience';

interface PWAInstallBannerProps {
  isInstallable: boolean;
  isStandalone: boolean;
  isIOS: boolean;
  onInstall: () => void;
  newVersionAvailable: boolean;
  onUpdate: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  isInstallable,
  isStandalone,
  isIOS,
  onInstall,
  newVersionAvailable,
  onUpdate,
}) => {
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // If already installed or dismissed, only show if new version available
  if (dismissed && !newVersionAvailable) return null;

  return (
    <>
      {/* New Version Available Banner */}
      {newVersionAvailable && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-neutral-900 border border-sky-400/40 shadow-2xl flex items-center gap-3 backdrop-blur-xl animate-bounce">
          <span className="text-xs font-mono text-neutral-200">
            NEW VERSION AVAILABLE
          </span>
          <button
            onClick={() => {
              playKeyClick();
              onUpdate();
            }}
            className="px-3 py-1 rounded-xl bg-sky-500 hover:bg-sky-400 text-neutral-950 text-xs font-mono font-bold flex items-center gap-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>UPDATE</span>
          </button>
        </div>
      )}

      {/* iOS Installation Guide Modal */}
      {showIOSModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
          onClick={() => setShowIOSModal(false)}
        >
          <div 
            className="w-full max-w-sm rounded-3xl bg-[#090d16] border border-white/10 shadow-2xl p-6 text-neutral-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-sky-400" />
                <h3 className="font-['Cinzel',serif] text-sm font-semibold text-neutral-100">
                  INSTALL ON IPHONE / IPAD
                </h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-4 text-xs text-neutral-300 leading-relaxed font-sans">
              1. Tap the <strong>Share</strong> icon in the Safari toolbar.<br />
              2. Scroll down and tap <strong>Add to Home Screen</strong>.<br />
              3. Launch <strong>মনের কথা</strong> directly from your home screen.
            </p>
            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono text-white transition"
            >
              GOT IT
            </button>
          </div>
        </div>
      )}
    </>
  );
};
