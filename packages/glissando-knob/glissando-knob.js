class GlissandoKnob extends HTMLElement {
  connectedCallback() {
    const div = document.createElement('div');
    div.innerText = 'knob';

    this.appendChild(div);
  }
}

customElements.define('glissando-knob', GlissandoKnob);
