const MAX_GAIN = 1;
const OSC_FREQ = 440;

const audioCtx = new AudioContext();

const amp = audioCtx.createGain();
const setGainValue = value => {
  amp.gain.setValueAtTime(value, audioCtx.currentTime);
};
setGainValue(MAX_GAIN);

const osc = audioCtx.createOscillator();
osc.frequency.setValueAtTime(OSC_FREQ, audioCtx.currentTime);
osc.connect(amp).connect(audioCtx.destination);
osc.start();

document.getElementById('volume').addEventListener('input', e => {
  setGainValue(parseFloat(e.target.value));
});

document.getElementById('start').addEventListener('click', () => {
  audioCtx.resume();
});

document.getElementById('stop').addEventListener('click', () => {
  audioCtx.suspend();
});
