async function run() {
  // audio context
  const audioCtx = new AudioContext();
  audioCtx.suspend();

  // input
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const input = audioCtx.createMediaStreamSource(stream);

  // fx
  const CUTTOFF_FREQUENCY = 500; // hz
  const biquadFilter = audioCtx.createBiquadFilter();
  biquadFilter.type = 'low-pass';
  biquadFilter.frequency.setValueAtTime(CUTTOFF_FREQUENCY, audioCtx.currentTime);

  // output
  const OUTPUT_GAIN = 1;
  const amp = audioCtx.createGain();
  amp.gain.setValueAtTime(OUTPUT_GAIN, audioCtx.currentTime);

  // routing
  input.connect(biquadFilter).connect(amp).connect(audioCtx.destination);

  // event handlers
  document.getElementById('recordButton').addEventListener('click', () => {
    audioCtx.suspend();
  });
  document.getElementById('startButton').addEventListener('click', () => {
    audioCtx.resume();
  });
}

run();