#[cfg(target_arch = "x86_64")]
#[macro_use]
extern crate vst;

#[cfg(target_arch = "x86_64")]
mod native;

#[cfg(target_arch = "x86_64")]
#[allow(unused_imports)]
use self::native::*;

#[cfg(target_arch = "wasm32")]
mod wasm;

#[cfg(target_arch = "wasm32")]
#[allow(unused_imports)]
use self::wasm::*;