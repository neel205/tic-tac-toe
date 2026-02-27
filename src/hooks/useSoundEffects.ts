const ctx = () => new (window.AudioContext || (window as any).webkitAudioContext)();

function playTone(freq: number, duration: number, type: OscillatorType = "sine", volume = 0.15) {
  const ac = ctx();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + duration);
}

export function playPlaceX() {
  playTone(600, 0.12, "square", 0.1);
}

export function playPlaceO() {
  playTone(440, 0.12, "sine", 0.12);
}

export function playWin() {
  const ac = ctx();
  [523, 659, 784].forEach((freq, i) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.15, ac.currentTime + i * 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + i * 0.15 + 0.3);
    osc.connect(gain).connect(ac.destination);
    osc.start(ac.currentTime + i * 0.15);
    osc.stop(ac.currentTime + i * 0.15 + 0.3);
  });
}

export function playDraw() {
  playTone(300, 0.3, "triangle", 0.1);
}
