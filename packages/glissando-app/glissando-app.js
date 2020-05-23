const runWasm = async () => {
  const rust = await import('/web_modules/@glissando/glissando-synth/glissando_synth.js');
  await rust.default();

  const MAX_GAIN = 1;
  const OSC_FREQ = 440;

  const audioCtx = new AudioContext();

  const setGainValue = (amp, value) => {
    amp.gain.setValueAtTime(value, audioCtx.currentTime);
  };

  function createSineWaveAudioBuffer(duration) {
    // audio buffer with 2 channels, 10 seconds
    const audioBuffer = audioCtx.createBuffer(
      2,
      audioCtx.sampleRate * duration,
      audioCtx.sampleRate,
    );
    // Fill the buffer with a sine wave
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel += 1) {
      // This gives us the actual array that contains the data
      const nowBuffering = audioBuffer.getChannelData(channel);
      for (let i = 0; i < audioBuffer.length; i += 1) {
        nowBuffering[i] = rust.generate_sample(i, audioCtx.sampleRate);
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

  setGainValue(amp, MAX_GAIN / 10);
  setGainValue(amp2, MAX_GAIN / 10);

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

  async function setupAudioWorklet() {
    try {
      await audioCtx.audioWorklet.addModule('/packages/glissando-app/white-noise-processor.js');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }

    const whiteNoiseAmp = audioCtx.createGain();
    const whiteNoiseNode = new AudioWorkletNode(audioCtx, 'white-noise-processor');

    setGainValue(whiteNoiseAmp, MAX_GAIN / 10);

    whiteNoiseNode.connect(whiteNoiseAmp).connect(audioCtx.destination);

    document.getElementById('volume-white-noise').addEventListener('input', e => {
      setGainValue(whiteNoiseAmp, parseFloat(e.target.value));
    });
  }

  setupAudioWorklet();

  /* async function init() {
  // eslint-disable-next-line import/no-unresolved
  const js = await import('./glissando-vst/glissando_vst.js');

  await js.default();
  console.log(js.generate_sample(1, 1));
  js.greet('WebAssembly');
  audioCtx.suspend();
}

init(); */
};

runWasm();
