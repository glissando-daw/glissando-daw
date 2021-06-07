use dsp::{Frame, FromSample, Graph, Node, NodeIndex, Sample};
use vst::api::{Events, Supported};
use vst::buffer::AudioBuffer;
use vst::event::Event;
use vst::plugin::{CanDo, Category, Info, Plugin};

struct Synth {
  sample_rate: f64,
  graph: Option<Graph<[f32; 2], DspNode>>,
  synth_index: Option<NodeIndex>,
}

impl Synth {
  fn process_midi_event(&mut self, data: [u8; 3]) {
    match data[0] {
      128 => self.note_off(data[1]),
      144 => self.note_on(data[1]),
      _ => (),
    }
  }

  fn note_on(&mut self, note: u8) {
    let freq = midi_pitch_to_freq(note);
    self.set_freq(freq);
  }

  fn note_off(&mut self, _note: u8) {
    self.set_freq(0.0);
  }

  fn set_freq(&mut self, freq: f64) {
    if let (Some(graph), Some(synth_index)) = (&mut self.graph, self.synth_index) {
      if let Some(DspNode::Synth(_, ref mut synth_hz)) = graph.node_mut(synth_index) {
          *synth_hz = freq;
      }
    }
  }
}

impl Default for Synth {
  fn default() -> Synth {
    Synth {
      sample_rate: 44100.0,
      graph: None,
      synth_index: None,
    }
  }
}

impl Plugin for Synth {
  fn get_info(&self) -> Info {
    Info {
      name: "Synth".to_string(),
      vendor: "Glissando".to_string(),
      unique_id: 6667,
      category: Category::Synth,
      inputs: 0,
      outputs: 2,
      parameters: 0,
      initial_delay: 0,
      ..Info::default()
    }
  }

  #[allow(unused_variables)]
  #[allow(clippy::single_match)]
  fn process_events(&mut self, events: &Events) {
    for event in events.events() {
      match event {
        Event::Midi(ev) => self.process_midi_event(ev.data),
        _ => (),
      }
    }
  }

  fn set_sample_rate(&mut self, rate: f32) {
    self.sample_rate = f64::from(rate);
  }

  fn init(&mut self) {
    let mut graph = Graph::new();
    let synth_index = graph.add_node(DspNode::Synth(0.0, 0.0));
    let (_, volume) = graph.add_output(synth_index, DspNode::Volume(1.0));

    graph.set_master(Some(volume));
    self.graph = Some(graph);
    self.synth_index = Some(synth_index);
  }

  fn process(&mut self, buffer: &mut AudioBuffer<f32>) {
    if let Some(graph) = &mut self.graph {
      let (_, mut outputs) = buffer.split();
      let left = outputs.get_mut(0);
      let right = outputs.get_mut(1);
      let mut hostbuffer: Vec<[f32; 2]> = left
        .iter_mut()
        .zip(right.iter_mut())
        .map(|(l, r)| [l.to_sample::<f32>(), r.to_sample::<f32>()])
        .collect();
      let graphbuffer: &mut [[f32; 2]] = hostbuffer.as_mut_slice();

      graph.audio_requested(graphbuffer, self.sample_rate);

      for (i, val) in graphbuffer.iter().enumerate() {
        left[i] = val[0];
        right[i] = val[1];
      }
    };
  }

  fn can_do(&self, can_do: CanDo) -> Supported {
    match can_do {
      CanDo::ReceiveMidiEvent => Supported::Yes,
      _ => Supported::Maybe,
    }
  }
}

const CHANNELS: usize = 2;

enum DspNode {
  Synth(f64, f64),
  Volume(f32),
}

impl Node<[f32; CHANNELS]> for DspNode {
  fn audio_requested(&mut self, buffer: &mut [[f32; CHANNELS]], sample_hz: f64) {
    match *self {
      DspNode::Synth(ref mut phase, synth_hz) => dsp::slice::map_in_place(buffer, |_| {
        let val = sine_wave(*phase);
        *phase += synth_hz / sample_hz;
        Frame::from_fn(|_| val)
      }),
      DspNode::Volume(vol) => dsp::slice::map_in_place(buffer, |f| f.map(|s| s.mul_amp(vol))),
    }
  }
}

fn sine_wave<S: Sample>(phase: f64) -> S
where
  S: Sample + FromSample<f32>,
{
  use std::f64::consts::PI;
  ((phase * PI * 2.0).sin() as f32).to_sample::<S>()
}

fn midi_pitch_to_freq(pitch: u8) -> f64 {
  const A4_PITCH: i8 = 69;
  const A4_FREQ: f64 = 440.0;

  ((f64::from(pitch as i8 - A4_PITCH)) / 12.).exp2() * A4_FREQ
}

plugin_main!(Synth);
