/* eslint-disable class-methods-use-this */

class WhiteNoiseProcessor extends AudioWorkletProcessor {
  process(_, outputs) {
    const output = outputs[0];
    output.forEach(channel => {
      for (let i = 0; i < channel.length; i += 1) {
        // eslint-disable-next-line no-param-reassign
        channel[i] = Math.random() * 2 - 1;
      }
    });
    return true;
  }
}

registerProcessor('white-noise-processor', WhiteNoiseProcessor);
