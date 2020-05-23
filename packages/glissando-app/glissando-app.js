const KEY_TO_NOTE = {
  KeyA: 'C4',
  KeyW: 'C#4',
  KeyS: 'D4',
  KeyE: 'D#4',
  KeyD: 'E4',
  KeyF: 'F4',
  KeyT: 'F#4',
  KeyG: 'G4',
  KeyY: 'G#4',
  KeyH: 'A4',
  KeyU: 'A#4',
  KeyJ: 'B4',
  KeyK: 'C5',
};

const runWasm = async () => {
  const rust = await import('/web_modules/@glissando/glissando-synth/glissando_synth.js');
  await rust.default();

  const synth = new rust.Osc();
  synth.suspend();

  document.addEventListener('keydown', e => {
    if (!(e.code in KEY_TO_NOTE)) {
      return;
    }

    const note = KEY_TO_NOTE[e.code];
    synth.set_note(note);

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
