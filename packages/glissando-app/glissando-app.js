const runWasm = async () => {
  const rust = await import('/web_modules/@glissando/glissando-synth/glissando_synth.js');
  await rust.default();

  const synth = new rust.Osc();
  synth.suspend();

  document.getElementById('start').addEventListener('click', () => {
    synth.resume();
  });

  document.getElementById('stop').addEventListener('click', () => {
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
