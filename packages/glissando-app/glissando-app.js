import '../glissando-slider/glissando-slider.js';
import '../glissando-knob/glissando-knob.js';

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

class GlissandoApp extends HTMLElement {
  connectedCallback() {
    const main = document.createElement('main');

    const title = document.createElement('h1');
    title.innerText = 'Glissando';
    main.appendChild(title);

    this.slider = document.createElement('glissando-slider');
    main.appendChild(this.slider);

    const knob = document.createElement('glissando-knob');
    main.appendChild(knob);

    const footer = document.createElement('footer');

    const status = document.createElement('span');
    status.innerText = 'status';
    footer.appendChild(status);

    this.appendChild(main);
    this.appendChild(footer);

    this.slider.addEventListener('change', e => {
      status.innerText = `slider thumb position: ${e.detail}`;
    });

    this.runWasm();
  }

  async runWasm() {
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

    this.slider.addEventListener('change', e => {
      synth.set_osc_amp(parseFloat(e.detail));
    });
  }
}

customElements.define('glissando-app', GlissandoApp);
