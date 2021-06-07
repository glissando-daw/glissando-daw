#!/bin/bash

cargo build --release
./scripts/osx_vst_bundler.sh Synth target/release/libglissando_synth.dylib
 sudo rm -rf /Library/Audio/Plug-Ins/VST/Synth.vst
sudo chown -R root:wheel Synth.vst
sudo mv Synth.vst /Library/Audio/Plug-Ins/VST
