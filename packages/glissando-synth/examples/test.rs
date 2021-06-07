extern crate portaudio;
extern crate sample;

use std::f64::consts::PI;

const CHANNELS: i32 = 2;
const FRAMES: u32 = 64;
const SAMPLE_HZ: f64 = 44_100.0;
const DURATION: i32 = 2;
const N_FRAMES: i32 = (SAMPLE_HZ as i32) * DURATION;
const SYNTH_HZ: f64 = 440.0;

fn main() {
  run().unwrap()
}

fn square_wave(phase: f64) -> f32 {
  let val = (phase * PI * 2.0).sin();

  if val >= 0.0 {
    1.0
  } else{
    -1.0
  }
}

fn run() -> Result<(), portaudio::Error> {
  let pa = portaudio::PortAudio::new()?;
  let settings = pa.default_output_stream_settings::<f32>(CHANNELS, SAMPLE_HZ, FRAMES)?;

  println!("Devices");
  println!("=======");
  for device in pa.devices()? {
    let (device_index, device_info) = device?;
    println!("{}: {}", device_index.0, device_info.name);
  }

  let mut frames_count = 0;
  let mut phase = 0.0;

  let callback = move |portaudio::OutputStreamCallbackArgs { buffer, frames, .. }| {
    let buffer: &mut [[f32; CHANNELS as usize]] =
      sample::slice::to_frame_slice_mut(buffer).unwrap();

    for frame in buffer {
      let val = square_wave(phase);

      frame[0] = val;
      frame[1] = val;

      phase += SYNTH_HZ / SAMPLE_HZ;
    }

    frames_count += frames;

    if frames_count >= (N_FRAMES as usize) {
      portaudio::Complete
    } else {
      portaudio::Continue
    }
  };

  let mut stream = pa.open_non_blocking_stream(settings, callback)?;
  stream.start()?;

  while let Ok(true) = stream.is_active() {
    std::thread::sleep(std::time::Duration::from_millis(16));
  }

  Ok(())
}
