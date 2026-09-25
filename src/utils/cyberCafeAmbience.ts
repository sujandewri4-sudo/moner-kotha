/**
 * Pure Web Audio API generator for authentic 2000s Indian Cyber Cafe ambience:
 * - Subtle CRT monitor 60Hz warm hum
 * - Gentle retro computer fan murmur
 * - Mechanical keyboard click sound effect
 */

let audioCtx: AudioContext | null = null;
let humGain: GainNode | null = null;
let humOsc: OscillatorNode | null = null;
let noiseGain: GainNode | null = null;
let isAmbienceRunning = false;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function toggleCyberCafeAmbience(enable?: boolean): boolean {
  try {
    const ctx = getAudioContext();
    const shouldRun = enable !== undefined ? enable : !isAmbienceRunning;

    if (shouldRun && !isAmbienceRunning) {
      // 1. Subtle 60Hz warm CRT hum
      humOsc = ctx.createOscillator();
      humOsc.type = 'sine';
      humOsc.frequency.setValueAtTime(60, ctx.currentTime);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, ctx.currentTime);

      humGain = ctx.createGain();
      humGain.gain.setValueAtTime(0.015, ctx.currentTime); // gentle warm low level

      humOsc.connect(filter);
      filter.connect(humGain);
      humGain.connect(ctx.destination);
      humOsc.start();

      // 2. Gentle air / PC fan pinkish noise
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.96 * b1 + white * 0.11;
        b2 = 0.86 * b2 + white * 0.25;
        output[i] = (b0 + b1 + b2) * 0.04;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const fanFilter = ctx.createBiquadFilter();
      fanFilter.type = 'lowpass';
      fanFilter.frequency.setValueAtTime(320, ctx.currentTime);

      noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.012, ctx.currentTime);

      whiteNoise.connect(fanFilter);
      fanFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      whiteNoise.start();

      isAmbienceRunning = true;
    } else if (!shouldRun && isAmbienceRunning) {
      if (humGain && ctx) {
        humGain.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
      }
      if (noiseGain && ctx) {
        noiseGain.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
      }
      setTimeout(() => {
        try {
          humOsc?.stop();
          humOsc?.disconnect();
          humOsc = null;
          isAmbienceRunning = false;
        } catch {
          // ignore
        }
      }, 300);
      isAmbienceRunning = false;
    }

    return isAmbienceRunning;
  } catch (err) {
    console.warn('AudioContext error:', err);
    return false;
  }
}

export function playKeyClick() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400 + Math.random() * 300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.02);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.025);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.03);
  } catch {
    // ignore
  }
}
