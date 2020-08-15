import init, {
  Synth,
} from '../../web_modules/@glissando/glissando-synth/glissando_synth.js';
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

async function run() {
  await init();

  class GlissandoApp extends HTMLElement {
    constructor() {
      super();

      this.synth = new Synth();
      this.synth.suspend();
    }

    connectedCallback() {
      this.createMarkup();
      this.setupEventListeners();
    }

    createMarkup() {
      this.innerHTML = `
        <main>
          <h1>Glissando</h1>
          <glissando-slider></glissando-slider>
          <glissando-knob></glissando-knob>
        </main>
        <footer>
          <span>status</span>
        </footer>
      `;
    }

    setupEventListeners() {
      const status = document.querySelector('span');
      const slider = document.querySelector('glissando-slider');
      const knob = document.querySelector('glissando-knob');

      slider.addEventListener('change', e => {
        status.innerText = `slider thumb position: ${e.detail}`;
      });

      knob.addEventListener('change', e => {
        status.innerText = `knob angle: ${e.detail}`;
      });

      document.addEventListener('keydown', e => {
        if (!(e.code in KEY_TO_NOTE)) {
          return;
        }

        const note = KEY_TO_NOTE[e.code];
        this.synth.set_note(note);

        this.synth.resume();
      });

      document.addEventListener('keyup', () => {
        this.synth.suspend();
      });

      slider.addEventListener('change', e => {
        this.synth.set_osc_amp(parseFloat(e.detail));
      });

      knob.addEventListener('change', e => {
        this.synth.set_audio_buffer_amp(parseFloat(e.detail));
      });
    }
  }

  customElements.define('glissando-app', GlissandoApp);
}

run();
