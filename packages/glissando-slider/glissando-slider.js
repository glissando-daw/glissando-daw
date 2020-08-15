const WIDTH = 64;
const HEIGHT = 256;
const TRACK_STROKE_SIZE = 1;
const THUMB_STROKE_SIZE = 2;
const THUMB_WIDTH = 24;

class GlissandoSlider extends HTMLElement {
  constructor() {
    super();

    this.thumbPosition = HEIGHT / 2;
  }

  connectedCallback() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = WIDTH;
    this.canvas.height = HEIGHT;
    this.canvas.addEventListener('click', e => this.onMouseClick(e));
    this.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');

    this.draw();
  }

  draw() {
    // background
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, WIDTH, HEIGHT);

    this.ctx.fillStyle = 'white';

    // track
    this.ctx.fillRect(WIDTH / 2, 0, TRACK_STROKE_SIZE, HEIGHT);

    // thumb
    this.ctx.fillRect(
      WIDTH / 2 - THUMB_WIDTH / 2,
      this.thumbPosition,
      THUMB_WIDTH,
      THUMB_STROKE_SIZE
    );
  }

  onMouseClick(e) {
    const { y } = e;
    const { top } = this.canvas.getBoundingClientRect();

    this.thumbPosition = Math.round(y - top);
    this.amount = 1.0 - this.thumbPosition / HEIGHT;

    this.draw();

    this.dispatchEvent(
      new CustomEvent('change', {
        detail: this.amount,
      })
    );
  }
}

customElements.define('glissando-slider', GlissandoSlider);
