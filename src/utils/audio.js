// Web Audio API Sound Synthesizer
let audioCtx = null;
let isAudioMuted = false;

export function getIsAudioMuted() {
  return isAudioMuted;
}

export function setIsAudioMuted(muted) {
  isAudioMuted = muted;
  return isAudioMuted;
}

export function toggleAudioMuted() {
  isAudioMuted = !isAudioMuted;
  return isAudioMuted;
}

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playBeep(freq = 880, type = 'sine', duration = 0.15, gainVal = 0.1) {
  if (isAudioMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(gainVal, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.error('Audio play error:', e);
  }
}

export function playOvertimeAlert() {
  if (isAudioMuted) return;
  playBeep(440, 'sawtooth', 0.2, 0.15);
  setTimeout(() => playBeep(330, 'sawtooth', 0.3, 0.2), 200);
}

export function playSuccessSound() {
  if (isAudioMuted) return;
  playBeep(523.25, 'sine', 0.1, 0.12); // C5
  setTimeout(() => playBeep(659.25, 'sine', 0.1, 0.12), 100); // E5
  setTimeout(() => playBeep(783.99, 'sine', 0.2, 0.15), 200); // G5
}

export function playFailSound() {
  if (isAudioMuted) return;
  playBeep(440, 'triangle', 0.12, 0.12);
  setTimeout(() => playBeep(349.23, 'triangle', 0.25, 0.15), 130);
}

