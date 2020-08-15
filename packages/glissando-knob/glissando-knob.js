const SIZE = 64;
const THUMB_WIDTH = SIZE / 5;
const CENTER_X = SIZE / 2;
const CENTER_Y = SIZE / 2;
const OFFSET_ANGLE = (45 * Math.PI) / 180;
const OFFSET_RADIUS = SIZE / 4 - THUMB_WIDTH / 2;
const MIN_ANGLE = Math.PI - OFFSET_ANGLE;
const MAX_ANGLE = 2 * Math.PI + OFFSET_ANGLE;

class GlissandoKnob extends HTMLElement {
  constructor() {
    super();

    this.thumbAngle = 1.5 * Math.PI;
  }

  connectedCallback() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = SIZE;
    this.canvas.height = SIZE;
    this.canvas.addEventListener('click', e => this.onMouseClick(e));
    this.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');

    this.draw();
  }

  draw() {
    // background
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, SIZE, SIZE);

    this.ctx.strokeStyle = 'white';

    // track
    this.ctx.beginPath();
    this.ctx.arc(CENTER_X, CENTER_Y, SIZE / 4, MIN_ANGLE, MAX_ANGLE);
    this.ctx.stroke();

    // thumb
    const startX = CENTER_X + OFFSET_RADIUS * Math.cos(this.thumbAngle);
    const startY = CENTER_Y + OFFSET_RADIUS * Math.sin(this.thumbAngle);
    const endX =
      CENTER_X + (OFFSET_RADIUS + THUMB_WIDTH) * Math.cos(this.thumbAngle);
    const endY =
      CENTER_Y + (OFFSET_RADIUS + THUMB_WIDTH) * Math.sin(this.thumbAngle);

    this.ctx.beginPath();
    this.ctx.moveTo(startX, startY);
    this.ctx.lineTo(endX, endY);
    this.ctx.stroke();
  }

  onMouseClick(e) {
    const { x, y } = e;
    const { top, left } = this.canvas.getBoundingClientRect();

    const clickX = x - left - CENTER_X;
    const clickY = y - top - CENTER_Y;

    this.thumbAngle = Math.atan2(clickY, clickX);

    // map atan2 range from [0, pi] to [0, pi], and from [-pi, 0] to [pi, 2*pi]
    if (this.thumbAngle < 0) {
      this.thumbAngle += 2.0 * Math.PI;
    }

    // map from [0, pi/4] to [2*pi, 5/4*pi] to make normalization continuous
    if (this.thumbAngle >= 0 && this.thumbAngle <= OFFSET_ANGLE) {
      this.thumbAngle += 2.0 * Math.PI;
    }

    // truncate not allowed values to min and max angle
    if (
      OFFSET_ANGLE <= this.thumbAngle &&
      this.thumbAngle <= 2 * OFFSET_ANGLE
    ) {
      this.thumbAngle = MAX_ANGLE;
    }
    if (
      2 * OFFSET_ANGLE <= this.thumbAngle &&
      this.thumbAngle <= 3 * OFFSET_ANGLE
    ) {
      this.thumbAngle = MIN_ANGLE;
    }

    this.amount = (this.thumbAngle - MIN_ANGLE) / (MAX_ANGLE - MIN_ANGLE);

    this.draw();

    this.dispatchEvent(
      new CustomEvent('change', {
        detail: this.amount,
      })
    );
  }
}

customElements.define('glissando-knob', GlissandoKnob);
