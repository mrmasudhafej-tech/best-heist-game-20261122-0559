// Synthesised WebAudio sounds only — no audio files. A small
// oscillator/noise helper builds footsteps, the coin clink, the
// lockpick tick, the loot chime, the smoke whoosh and the alarm.
export function createAudio() {
  return {
    context: null,
    muted: false,
    alarmOn: false,
    alarmTimer: null,
  };
}

export function ensureAudio(audio) {
  if (!audio.context) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return;
    audio.context = new Ctor();
  }
  if (audio.context.state === 'suspended') audio.context.resume();
}

function tone(audio, freq, seconds, type, gainValue, slideTo) {
  if (!audio.context || audio.muted) return;
  const now = audio.context.currentTime;
  const osc = audio.context.createOscillator();
  const gain = audio.context.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, now + seconds);
  gain.gain.setValueAtTime(gainValue, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + seconds);
  osc.connect(gain).connect(audio.context.destination);
  osc.start(now);
  osc.stop(now + seconds);
}

function noiseBurst(audio, seconds, gainValue, filterFreq) {
  if (!audio.context || audio.muted) return;
  const now = audio.context.currentTime;
  const length = Math.floor(audio.context.sampleRate * seconds);
  const buffer = audio.context.createBuffer(1, length, audio.context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  const source = audio.context.createBufferSource();
  source.buffer = buffer;
  const filter = audio.context.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = filterFreq;
  const gain = audio.context.createGain();
  gain.gain.value = gainValue;
  source.connect(filter).connect(gain).connect(audio.context.destination);
  source.start(now);
}

export function playFootstep(audio, running) {
  noiseBurst(audio, 0.06, running ? 0.08 : 0.045, 500);
}

export function playCoinClink(audio) {
  tone(audio, 2400, 0.18, 'sine', 0.12, 1800);
  tone(audio, 3100, 0.1, 'sine', 0.06);
}

export function playLockTick(audio) {
  tone(audio, 900, 0.07, 'square', 0.05, 700);
}

export function playLootChime(audio) {
  tone(audio, 660, 0.22, 'sine', 0.12);
  setTimeout(() => tone(audio, 880, 0.26, 'sine', 0.12), 90);
  setTimeout(() => tone(audio, 1320, 0.34, 'sine', 0.12), 190);
}

export function playSmokeWhoosh(audio) {
  noiseBurst(audio, 0.5, 0.14, 900);
}

export function playAlarmBeep(audio) {
  tone(audio, 740, 0.16, 'square', 0.07, 620);
}

export function playCaughtSting(audio) {
  tone(audio, 220, 0.5, 'sawtooth', 0.1, 110);
  tone(audio, 165, 0.6, 'sawtooth', 0.08, 90);
}

export function playDoorUnlock(audio) {
  tone(audio, 520, 0.14, 'triangle', 0.1);
  setTimeout(() => tone(audio, 780, 0.2, 'triangle', 0.1), 110);
}

export function playWinFanfare(audio) {
  [523, 659, 784, 1047].forEach((freq, i) => {
    setTimeout(() => tone(audio, freq, 0.3, 'triangle', 0.12), i * 130);
  });
}

export function toggleMute(audio) {
  audio.muted = !audio.muted;
  return audio.muted;
}
