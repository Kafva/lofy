#![allow(unused_imports)] //dev
#![allow(non_upper_case_globals)]

mod config;
mod app;
mod macros;
mod util;

use yew::prelude::*;
use yew::{Callback, function_component, html, use_state};

use wasm_bindgen::prelude::*;
use wasm_bindgen::{JsCast,JsValue};
use wasm_bindgen_futures::spawn_local;

use web_sys::console;
use js_sys;



// Hooks: https://yew.rs/docs/concepts/function-components/pre-defined-hooks
// Components


// How do we make a HTTP request and pass the data to a prop...

#[wasm_bindgen]
pub fn run() -> Result<(), JsValue> {

    yew::start_app::<app::App>();
    Ok(())
}


/// Any function defined with `wasm_bindgen` will be given a stub that allows
/// for calling it in Javascript
#[wasm_bindgen]
pub fn big_xd() -> Result<JsValue,JsValue> {
    console::log_1(&JsValue::from("BIG XD"));
    Ok(JsValue::from("HEY"))
}


