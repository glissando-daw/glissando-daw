const MAX_GAIN = 1;
const OSC_FREQ = 440;
const ANGULAR_FREQUENCY = 2.0 * OSC_FREQ * 2 * Math.PI;

const audioCtx = new AudioContext();

const setGainValue = (amp, value) => {
  amp.gain.setValueAtTime(value, audioCtx.currentTime);
};

function generateSample(sampleNumber) {
  const sampleTime = sampleNumber / audioCtx.sampleRate;
  const sampleAngle = sampleTime * ANGULAR_FREQUENCY;
  return Math.sin(sampleAngle);
}

function createSineWaveAudioBuffer(duration) {
  // audio buffer with 2 channels, 10 seconds
  const audioBuffer = audioCtx.createBuffer(2, audioCtx.sampleRate * duration, audioCtx.sampleRate);
  // Fill the buffer with a sine wave
  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel += 1) {
    // This gives us the actual array that contains the data
    const nowBuffering = audioBuffer.getChannelData(channel);
    for (let i = 0; i < audioBuffer.length; i += 1) {
      nowBuffering[i] = generateSample(i);
    }
  }
  return audioBuffer;
}

const amp = audioCtx.createGain();
const osc = audioCtx.createOscillator();
osc.frequency.setValueAtTime(OSC_FREQ, audioCtx.currentTime);

const amp2 = audioCtx.createGain();
const source = audioCtx.createBufferSource();
source.buffer = createSineWaveAudioBuffer(15);

setGainValue(amp, MAX_GAIN);
setGainValue(amp2, MAX_GAIN);

osc.connect(amp).connect(audioCtx.destination);
osc.start();
source.connect(amp2).connect(audioCtx.destination);
source.start();

audioCtx.suspend();

document.getElementById('start').addEventListener('click', () => {
  audioCtx.resume();
});

document.getElementById('stop').addEventListener('click', () => {
  audioCtx.suspend();
});

document.getElementById('volume-osc').addEventListener('input', e => {
  setGainValue(amp, parseFloat(e.target.value));
});

document.getElementById('volume-src-buffer').addEventListener('input', e => {
  setGainValue(amp2, parseFloat(e.target.value));
});
