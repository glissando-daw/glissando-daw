extern crate wasm_bindgen;
//extern crate wasm_bindgen_futures;

use wasm_bindgen::prelude::*;
//use futures::executor::block_on;
use web_sys::*;

static MAX_GAIN: f32 = 1.0;
static OSC_FREQ: f32 = 440.0;
static ANGULAR_FREQUENCY: f32 = 2.0 * std::f32::consts::PI * OSC_FREQ;

pub fn generate_sample(sample_number: f32, sample_rate: f32) -> f32 {
    let sample_time = sample_number / sample_rate;
    let sample_angle = sample_time * ANGULAR_FREQUENCY;
    return f32::sin(sample_angle);
}

fn fill_samples(audio_buffer: &AudioBuffer, sample_rate: f32) {
    // Fill the buffer with a sine wave
    let mut left_channel = audio_buffer.get_channel_data(0).unwrap();
    let mut right_channel = audio_buffer.get_channel_data(1).unwrap();
    for i in 0..audio_buffer.length() {
        let sample_time = i as f32 / sample_rate;
        let sample_angle = sample_time * ANGULAR_FREQUENCY;
        let sample = f32::sin(sample_angle);
        left_channel[i as usize] = sample;
        right_channel[i as usize] = sample;
    }
    audio_buffer
        .copy_to_channel(&mut left_channel, 0)
        .expect("Could not copy channel");
    audio_buffer
        .copy_to_channel(&mut right_channel, 1)
        .expect("Could not copy channel");
}

/*async fn audio_worklet_add_module(ctx: &AudioContext) -> Result<JsValue, JsValue> {
    let _audio_worklet = ctx.audio_worklet()?;
    let promise = _audio_worklet.add_module("/packages/glissando-app/white-noise-processor.js")?;
    let result = wasm_bindgen_futures::JsFuture::from(promise).await?;
    Ok(result)
}*/

#[wasm_bindgen]
pub struct Synth {
    ctx: AudioContext,
    osc: OscillatorNode,
    osc_amp: GainNode,
    audio_buffer_amp: GainNode,
    //white_noise_amp: GainNode,
}

impl Drop for Synth {
    fn drop(&mut self) {
        let _ = self.ctx.close();
    }
}

#[wasm_bindgen]
impl Synth {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Result<Synth, JsValue> {
        let ctx = AudioContext::new()?;

        let osc = ctx.create_oscillator()?;
        let osc_amp = ctx.create_gain()?;
        osc.frequency()
            .set_value_at_time(OSC_FREQ, ctx.current_time())?;
        osc_amp
            .gain()
            .set_value_at_time(MAX_GAIN / 10.0, ctx.current_time())?;
        osc.connect_with_audio_node(&osc_amp)?;
        osc_amp.connect_with_audio_node(&ctx.destination())?;

        let audio_buffer_source = ctx.create_buffer_source()?;
        let audio_buffer =
            ctx.create_buffer(2, ctx.sample_rate() as u32 * 15, ctx.sample_rate())?;
        let audio_buffer_amp = ctx.create_gain()?;
        fill_samples(&audio_buffer, ctx.sample_rate());
        audio_buffer_source.set_buffer(Some(&audio_buffer));
        audio_buffer_amp
            .gain()
            .set_value_at_time(MAX_GAIN / 10.0, ctx.current_time())?;
        audio_buffer_source.connect_with_audio_node(&audio_buffer_amp)?;
        audio_buffer_amp.connect_with_audio_node(&ctx.destination())?;

        //let white_noise_amp = ctx.create_gain()?;
        //block_on(audio_worklet_add_module(&ctx))?;
        //let white_noise_node = AudioWorkletNode::new(&ctx, "white-noise-processor")?;
        //white_noise_amp.gain().set_value_at_time(MAX_GAIN / 10.0, ctx.current_time())?;
        //white_noise_node.connect_with_audio_node(&white_noise_amp)?;
        //white_noise_amp.connect_with_audio_node(&ctx.destination())?;

        osc.start()?;
        audio_buffer_source.start()?;

        Ok(Synth {
            ctx,
            osc,
            osc_amp,
            audio_buffer_amp,
            //white_noise_amp,
        })
    }

    #[wasm_bindgen]
    pub fn set_osc_amp(&self, mut gain: f32) {
        if gain > 1.0 {
            gain = 1.0;
        }
        if gain < 0.0 {
            gain = 0.0;
        }
        self.osc_amp.gain().set_value(gain);
    }

    #[wasm_bindgen]
    pub fn set_audio_buffer_amp(&self, mut gain: f32) {
        if gain > 1.0 {
            gain = 1.0;
        }
        if gain < 0.0 {
            gain = 0.0;
        }
        self.audio_buffer_amp.gain().set_value(gain);
    }

    // #[wasm_bindgen]
    // pub fn set_white_noise_amp(&self, mut gain: f32) {
    //     if gain > 1.0 {
    //         gain = 1.0;
    //     }
    //     if gain < 0.0 {
    //         gain = 0.0;
    //     }
    //     self.white_noise_amp.gain().set_value(gain);
    // }

    #[wasm_bindgen]
    pub fn suspend(&self) {
        self.ctx.suspend();
    }

    #[wasm_bindgen]
    pub fn resume(&self) {
        self.ctx.resume();
    }

    #[wasm_bindgen]
    pub fn set_note(&self, note: String) {
        let mut note_to_freq = std::collections::HashMap::new();
        note_to_freq.insert("C4".to_string(), 261.64);
        note_to_freq.insert("C#4".to_string(), 277.20);
        note_to_freq.insert("D4".to_string(), 293.68);
        note_to_freq.insert("D#4".to_string(), 311.12);
        note_to_freq.insert("E4".to_string(), 329.64);
        note_to_freq.insert("F4".to_string(), 349.24);
        note_to_freq.insert("F#4".to_string(), 370.00);
        note_to_freq.insert("G4".to_string(), 392.00);
        note_to_freq.insert("G#4".to_string(), 415.32);
        note_to_freq.insert("A4".to_string(), 440.00);
        note_to_freq.insert("A#4".to_string(), 466.16);
        note_to_freq.insert("B4".to_string(), 493.92);
        note_to_freq.insert("C5".to_string(), 523.28);

        let freq = *note_to_freq.get(&note).unwrap() as f32;
        self.osc
            .frequency()
            .set_value_at_time(freq, self.ctx.current_time())
            .unwrap();
    }
}
