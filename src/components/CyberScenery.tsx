import React from 'react';
import { BackgroundPresetId } from '../types';

interface CyberSceneryProps {
  presetId: BackgroundPresetId;
}

export const CyberScenery: React.FC<CyberSceneryProps> = ({ presetId }) => {
  if (presetId === 'rainy-cafe') {
    return (
      <svg
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="rainSky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#050a14" />
            <stop offset="50%" stop-color="#0a1526" />
            <stop offset="100%" stop-color="#040711" />
          </linearGradient>
          <radialGradient id="neonStreetGlow" cx="30%" cy="60%" r="50%">
            <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.35" />
            <stop offset="50%" stop-color="#0369a1" stop-opacity="0.1" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
          </radialGradient>
          <radialGradient id="chaiStallAmber" cx="80%" cy="55%" r="45%">
            <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.4" />
            <stop offset="60%" stop-color="#b45309" stop-opacity="0.1" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
          </radialGradient>
          <radialGradient id="monitorPhosphor" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#22c55e" stop-opacity="0.25" />
            <stop offset="70%" stop-color="#15803d" stop-opacity="0.05" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
          </radialGradient>
          <filter id="rainBlur" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" />
          </filter>
        </defs>

        {/* Night Sky & Deep Storm Backdrop */}
        <rect width="1920" height="1080" fill="url(#rainSky)" />

        {/* Distant street lights & neon signs blurred through wet window glass */}
        <circle cx="480" cy="580" r="280" fill="url(#neonStreetGlow)" filter="url(#rainBlur)" />
        <circle cx="1520" cy="520" r="320" fill="url(#chaiStallAmber)" filter="url(#rainBlur)" />

        {/* Distant hazy street silhouettes */}
        <rect x="360" y="420" width="120" height="240" fill="#0c182b" opacity="0.6" filter="url(#rainBlur)" />
        <rect x="520" y="380" width="90" height="280" fill="#08101e" opacity="0.7" filter="url(#rainBlur)" />
        <rect x="1420" y="460" width="220" height="200" fill="#17140e" opacity="0.6" filter="url(#rainBlur)" />

        {/* Distant cyber cafe neon sign reflection outside */}
        <text x="500" y="480" font-family="monospace" font-size="28" font-weight="bold" fill="#38bdf8" opacity="0.3" filter="url(#rainBlur)">
          INTERNET CAFE
        </text>
        <text x="1460" y="520" font-family="sans-serif" font-size="36" font-weight="bold" fill="#f59e0b" opacity="0.35" filter="url(#rainBlur)">
          CHAI &amp; SNACKS
        </text>

        {/* Rainy Window Panes (Vertical & Horizontal mullions) */}
        <line x1="960" y1="0" x2="960" y2="1080" stroke="#0f172a" stroke-width="24" opacity="0.85" />
        <line x1="0" y1="540" x2="1920" y2="540" stroke="#0f172a" stroke-width="20" opacity="0.85" />

        {/* Rain streaks and water droplets running down the glass */}
        <g stroke="#93c5fd" stroke-linecap="round" opacity="0.45">
          {/* Vertical rain streaks */}
          <line x1="120" y1="80" x2="110" y2="340" stroke-width="2.5" />
          <line x1="110" y1="360" x2="105" y2="520" stroke-width="2" />
          <line x1="240" y1="40" x2="230" y2="420" stroke-width="3" />
          <line x1="380" y1="120" x2="375" y2="480" stroke-width="2" />
          <line x1="560" y1="60" x2="550" y2="380" stroke-width="3" />
          <line x1="720" y1="90" x2="710" y2="440" stroke-width="2" />
          <line x1="840" y1="150" x2="830" y2="500" stroke-width="3.5" />
          <line x1="1080" y1="70" x2="1070" y2="410" stroke-width="2.5" />
          <line x1="1220" y1="110" x2="1215" y2="490" stroke-width="3" />
          <line x1="1350" y1="50" x2="1340" y2="380" stroke-width="2" />
          <line x1="1500" y1="140" x2="1490" y2="520" stroke-width="3" />
          <line x1="1680" y1="80" x2="1670" y2="460" stroke-width="2.5" />
          <line x1="1810" y1="120" x2="1805" y2="510" stroke-width="2" />
        </g>

        {/* Individual glass water bead clusters */}
        <g fill="#bfdbfe" opacity="0.55">
          <ellipse cx="230" cy="430" rx="3.5" ry="5" />
          <ellipse cx="235" cy="470" rx="2" ry="3" />
          <ellipse cx="550" cy="390" rx="4" ry="6" />
          <ellipse cx="830" cy="510" rx="4.5" ry="7" />
          <ellipse cx="1215" cy="500" rx="3.5" ry="5.5" />
          <ellipse cx="1490" cy="530" rx="4" ry="6.5" />
          <ellipse cx="375" cy="220" rx="2.5" ry="3.5" />
          <ellipse cx="710" cy="260" rx="3" ry="4" />
          <ellipse cx="1070" cy="180" rx="2" ry="3" />
          <ellipse cx="1340" cy="220" rx="3.5" ry="4.5" />
          <ellipse cx="1670" cy="280" rx="2.5" ry="3.5" />
        </g>

        {/* Inside Cyber Cafe Window Sill & Desk */}
        <rect x="0" y="860" width="1920" height="220" fill="#070b14" stroke="#1e293b" stroke-width="6" />

        {/* Left foreground CRT monitor glow (Cabin 04) */}
        <rect x="80" y="660" width="340" height="260" rx="20" fill="#0f172a" stroke="#334155" stroke-width="8" opacity="0.85" />
        <rect x="105" y="685" width="290" height="210" rx="14" fill="#022c22" stroke="#14532d" stroke-width="4" />
        <rect x="105" y="685" width="290" height="210" rx="14" fill="url(#monitorPhosphor)" />
        {/* Terminal text lines */}
        <line x1="125" y1="715" x2="260" y2="715" stroke="#4ade80" stroke-width="4" opacity="0.7" />
        <line x1="125" y1="735" x2="340" y2="735" stroke="#4ade80" stroke-width="3" opacity="0.5" />
        <line x1="125" y1="755" x2="290" y2="755" stroke="#4ade80" stroke-width="3" opacity="0.5" />
        <line x1="125" y1="775" x2="160" y2="775" stroke="#4ade80" stroke-width="4" opacity="0.8" />

        {/* Steaming glass of Indian Cutting Chai on the desk */}
        <path d="M470 850 L460 920 L500 920 L490 850 Z" fill="#b45309" stroke="#fcd34d" stroke-width="2" opacity="0.85" />
        {/* Steam curly path */}
        <path d="M475 840 Q465 800 480 770 Q495 740 485 710" stroke="#f8fafc" stroke-width="2.5" fill="none" opacity="0.25" />
        <path d="M485 840 Q495 800 485 770 Q475 740 485 710" stroke="#f8fafc" stroke-width="2" fill="none" opacity="0.2" />

        {/* Right side foreground keyboard & coiled PS/2 wire */}
        <rect x="1450" y="890" width="380" height="90" rx="8" fill="#1e293b" stroke="#334155" stroke-width="4" opacity="0.7" />
        <path d="M1450 930 Q1400 960 1380 920 Q1360 880 1340 940" stroke="#475569" stroke-width="4" fill="none" opacity="0.6" />
      </svg>
    );
  }

  if (presetId === 'golden-office') {
    return (
      <svg
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="sunsetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#78350f" />
            <stop offset="35%" stop-color="#b45309" />
            <stop offset="70%" stop-color="#451a03" />
            <stop offset="100%" stop-color="#1c1917" />
          </linearGradient>
          <linearGradient id="warmRay" x1="0%" y1="0%" x2="100%" y2="70%">
            <stop offset="0%" stop-color="#fef08a" stop-opacity="0.35" />
            <stop offset="50%" stop-color="#f59e0b" stop-opacity="0.15" />
            <stop offset="100%" stop-color="#78350f" stop-opacity="0" />
          </linearGradient>
          <linearGradient id="beigeCrt" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#e2d6c3" />
            <stop offset="50%" stop-color="#d4c3aa" />
            <stop offset="100%" stop-color="#a8967c" />
          </linearGradient>
        </defs>

        {/* Deep Sunset Ambient Room Base */}
        <rect width="1920" height="1080" fill="url(#sunsetGrad)" />

        {/* Diagonal Golden Sunbeams slicing into the cyber workstation */}
        <polygon points="0,0 700,0 1500,1080 300,1080" fill="url(#warmRay)" />
        <polygon points="400,0 1100,0 1920,950 1000,1080" fill="url(#warmRay)" opacity="0.75" />

        {/* Venetian Blinds Slats (Horizontal shadow bars) */}
        <g fill="#0c0a09" opacity="0.35">
          <rect x="0" y="60" width="1920" height="35" />
          <rect x="0" y="135" width="1920" height="35" />
          <rect x="0" y="210" width="1920" height="35" />
          <rect x="0" y="285" width="1920" height="35" />
          <rect x="0" y="360" width="1920" height="35" />
          <rect x="0" y="435" width="1920" height="35" />
          <rect x="0" y="510" width="1920" height="35" />
          <rect x="0" y="585" width="1920" height="35" />
          <rect x="0" y="660" width="1920" height="35" />
          <rect x="0" y="735" width="1920" height="35" />
          <rect x="0" y="810" width="1920" height="35" />
          <rect x="0" y="885" width="1920" height="35" />
        </g>

        {/* Cyber Cafe Wooden Teak Desk */}
        <rect x="0" y="780" width="1920" height="300" fill="#29180c" stroke="#451a03" stroke-width="8" />

        {/* Vintage Beige 2000s CRT Monitor (Left Side Center) */}
        <g transform="translate(180, 480)">
          {/* Monitor Housing */}
          <rect x="0" y="0" width="460" height="380" rx="36" fill="url(#beigeCrt)" stroke="#8c785f" stroke-width="8" />
          {/* Curved Screen Glass */}
          <rect x="35" y="30" width="390" height="290" rx="22" fill="#0f172a" stroke="#71604a" stroke-width="6" />
          {/* Windows XP Bliss / Warm sunset desktop reflection on screen */}
          <path d="M35 220 Q160 160 280 230 Q360 270 425 240 L425 320 L35 320 Z" fill="#65a30d" opacity="0.5" />
          <rect x="35" y="300" width="390" height="20" fill="#0284c7" opacity="0.6" />
          {/* Green Power LED */}
          <circle cx="400" cy="355" r="4" fill="#22c55e" />
          {/* Monitor Stand */}
          <rect x="180" y="380" width="100" height="50" fill="#a8967c" stroke="#71604a" stroke-width="4" />
          <rect x="130" y="420" width="200" height="20" rx="8" fill="#a8967c" stroke="#71604a" stroke-width="4" />
        </g>

        {/* Beige CPU Tower on Desk (Right of Monitor) */}
        <g transform="translate(680, 440)">
          <rect x="0" y="0" width="170" height="420" rx="12" fill="url(#beigeCrt)" stroke="#8c785f" stroke-width="6" />
          {/* CD-ROM 52x drive bays */}
          <rect x="15" y="35" width="140" height="35" rx="4" fill="#d4c3aa" stroke="#8c785f" stroke-width="2" />
          <line x1="25" y1="60" x2="110" y2="60" stroke="#71604a" stroke-width="2" />
          <circle cx="135" cy="52" r="3" fill="#22c55e" />
          {/* Floppy Disk 3.5 Drive */}
          <rect x="15" y="90" width="140" height="30" rx="4" fill="#d4c3aa" stroke="#8c785f" stroke-width="2" />
          <rect x="30" y="102" width="80" height="5" fill="#3f3f46" />
          {/* Power Button & Turbo Button */}
          <circle cx="50" cy="180" r="14" fill="#d4c3aa" stroke="#71604a" stroke-width="3" />
          <rect x="80" y="172" width="20" height="16" rx="2" fill="#71604a" />
          {/* Air vents */}
          <line x1="25" y1="260" x2="145" y2="260" stroke="#71604a" stroke-width="3" />
          <line x1="25" y1="280" x2="145" y2="280" stroke="#71604a" stroke-width="3" />
          <line x1="25" y1="300" x2="145" y2="300" stroke="#71604a" stroke-width="3" />
        </g>

        {/* 2000s External 56k Modem on desk */}
        <g transform="translate(900, 770)">
          <rect x="0" y="0" width="180" height="60" rx="8" fill="#18181b" stroke="#3f3f46" stroke-width="3" />
          <text x="20" y="30" font-family="monospace" font-size="12" fill="#a1a1aa">56K FAX/MODEM</text>
          {/* Blinking LEDs: PWR, RD, SD, CD, OH */}
          <circle cx="30" cy="45" r="3" fill="#22c55e" />
          <circle cx="55" cy="45" r="3" fill="#ef4444" />
          <circle cx="80" cy="45" r="3" fill="#ef4444" />
          <circle cx="105" cy="45" r="3" fill="#22c55e" />
          <circle cx="130" cy="45" r="3" fill="#eab308" />
        </g>

        {/* Floating dust specks caught in the golden beam */}
        <g fill="#fef08a" opacity="0.6">
          <circle cx="450" cy="320" r="2.5" />
          <circle cx="520" cy="240" r="1.5" />
          <circle cx="680" cy="380" r="2" />
          <circle cx="760" cy="290" r="3" />
          <circle cx="850" cy="420" r="1.5" />
          <circle cx="940" cy="340" r="2.5" />
          <circle cx="1080" cy="480" r="2" />
          <circle cx="1200" cy="390" r="3" />
          <circle cx="1380" cy="540" r="2" />
        </g>
      </svg>
    );
  }

  if (presetId === 'midnight-lan') {
    return (
      <svg
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="lanDark" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#020617" />
            <stop offset="60%" stop-color="#060e20" />
            <stop offset="100%" stop-color="#02040a" />
          </linearGradient>
          <radialGradient id="greenRadarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#10b981" stop-opacity="0.45" />
            <stop offset="50%" stop-color="#047857" stop-opacity="0.15" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
          </radialGradient>
          <radialGradient id="cyanMonitorGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.4" />
            <stop offset="60%" stop-color="#0e7490" stop-opacity="0.1" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
          </radialGradient>
        </defs>

        {/* Pitch Black LAN Cave Backdrop */}
        <rect width="1920" height="1080" fill="url(#lanDark)" />

        {/* Long LAN Gaming Table running horizontally */}
        <rect x="0" y="740" width="1920" height="340" fill="#090d16" stroke="#1e293b" stroke-width="8" />

        {/* Multiple Glowing CRT Monitors side-by-side (LAN party row) */}

        {/* PC 01 (Left) - Cyan HUD Screen */}
        <g transform="translate(120, 420)">
          <circle cx="200" cy="180" r="260" fill="url(#cyanMonitorGlow)" />
          <rect x="0" y="0" width="400" height="340" rx="30" fill="#0b111e" stroke="#1e293b" stroke-width="8" />
          <rect x="25" y="25" width="350" height="260" rx="18" fill="#021019" stroke="#083344" stroke-width="4" />
          {/* Radar circle & grid lines */}
          <circle cx="100" cy="90" r="50" fill="none" stroke="#22d3ee" stroke-width="2.5" opacity="0.75" />
          <line x1="100" y1="40" x2="100" y2="140" stroke="#22d3ee" stroke-width="1.5" opacity="0.6" />
          <line x1="50" y1="90" x2="150" y2="90" stroke="#22d3ee" stroke-width="1.5" opacity="0.6" />
          <circle cx="120" cy="75" r="3.5" fill="#ef4444" />
          {/* Health & Ammo HUD in green */}
          <text x="40" y="260" font-family="monospace" font-size="24" font-weight="bold" fill="#22d3ee">100 HP</text>
          <text x="260" y="260" font-family="monospace" font-size="24" font-weight="bold" fill="#22d3ee">30 / 90</text>
          {/* Headset draped over the monitor corner */}
          <path d="M-10 120 Q5 20 60 10" stroke="#334155" stroke-width="16" fill="none" stroke-linecap="round" />
          <circle cx="-10" cy="120" r="24" fill="#0f172a" stroke="#475569" stroke-width="4" />
        </g>

        {/* PC 02 (Center Right) - Green Counter-Strike Radar Screen */}
        <g transform="translate(1360, 420)">
          <circle cx="200" cy="180" r="260" fill="url(#greenRadarGlow)" />
          <rect x="0" y="0" width="400" height="340" rx="30" fill="#0b111e" stroke="#1e293b" stroke-width="8" />
          <rect x="25" y="25" width="350" height="260" rx="18" fill="#021a12" stroke="#064e3b" stroke-width="4" />
          {/* Crosshair in bright green */}
          <circle cx="200" cy="155" r="3" fill="#10b981" />
          <line x1="180" y1="155" x2="192" y2="155" stroke="#10b981" stroke-width="2.5" />
          <line x1="208" y1="155" x2="220" y2="155" stroke="#10b981" stroke-width="2.5" />
          <line x1="200" y1="135" x2="200" y2="147" stroke="#10b981" stroke-width="2.5" />
          <line x1="200" y1="163" x2="200" y2="175" stroke="#10b981" stroke-width="2.5" />
          {/* HUD font */}
          <text x="40" y="260" font-family="monospace" font-size="24" font-weight="bold" fill="#10b981">SCORE: 15-14</text>
        </g>

        {/* Ethernet LAN Switch on Table with blinking port LEDs */}
        <g transform="translate(680, 800)">
          <rect x="0" y="0" width="560" height="90" rx="12" fill="#0f172a" stroke="#334155" stroke-width="4" />
          <text x="25" y="35" font-family="monospace" font-size="14" font-weight="bold" fill="#64748b">16-PORT 100MBPS LAN SWITCH</text>
          {/* 16 RJ-45 Ports with LEDs */}
          {Array.from({ length: 12 }).map((_, i) => (
            <g key={i} transform={`translate(${30 + i * 42}, 48)`}>
              <rect x="0" y="0" width="28" height="26" rx="3" fill="#1e293b" stroke="#475569" stroke-width="1.5" />
              <circle cx="14" cy="-8" r="3" fill={i % 2 === 0 ? '#10b981' : '#f59e0b'} />
            </g>
          ))}
        </g>

        {/* Blue and yellow LAN cable coils crossing the table */}
        <path d="M100 860 Q400 920 680 840" stroke="#0284c7" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.8" />
        <path d="M1240 840 Q1500 920 1800 860" stroke="#f59e0b" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.8" />
        <path d="M300 880 Q800 960 1400 880" stroke="#10b981" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.6" />

        {/* Ambient CRT Scanline Grid in LAN Room */}
        <g stroke="#38bdf8" stroke-width="1" opacity="0.15">
          <line x1="0" y1="200" x2="1920" y2="200" />
          <line x1="0" y1="400" x2="1920" y2="400" />
          <line x1="0" y1="600" x2="1920" y2="600" />
        </g>
      </svg>
    );
  }

  return null;
};
