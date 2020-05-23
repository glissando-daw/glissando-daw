const runWasm = async () => {
  const rust = await import('/web_modules/@glissando/glissando-synth/glissando_synth.js');
  await rust.default();

  const synth = new rust.Osc();
  synth.suspend();

  document.addEventListener('keydown', () => {
    synth.resume();
  });

  document.addEventListener('keyup', () => {
    synth.suspend();
  });

  document.getElementById('volume-osc').addEventListener('input', e => {
    synth.set_osc_amp(parseFloat(e.target.value));
  });

  document.getElementById('volume-src-buffer').addEventListener('input', e => {
    synth.set_audio_buffer_amp(parseFloat(e.target.value));
  });
};

runWasm();
