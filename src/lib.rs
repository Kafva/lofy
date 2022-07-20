#![allow(unused_imports)] //dev
#![allow(non_upper_case_globals)]
use yew::prelude::*;
use yew::{Callback, function_component, html, use_state};

use wasm_bindgen::prelude::*;
use wasm_bindgen::{JsCast,JsValue};

use web_sys::console;
use js_sys;

const PORT: i32 = 20111;

#[function_component(App)]
fn app() -> Html {

    html! {
        <>
        <h1>{ format!("Running on {PORT}") }</h1>
        <Counter/>
        </>
    }
}

#[function_component(Counter)]
fn counter() -> Html {
    // `use_state` will trigger a re-render everytime a new value is encountred
    // for `cnt`.
    let cnt = use_state(|| 0);
    let onclick = {
        let cnt = cnt.clone();
        Callback::from(move |_:MouseEvent| cnt.set(*cnt + 1))
    };

    // Calls to console log with different argument counts require their own
    // bindings
    console::log_1( 
        &JsValue::from(format!("Rendering counter componenet {}", *cnt))
    );

    html! {
        <button {onclick}>{ *cnt }</button>
    }
}

#[wasm_bindgen]
pub fn run() -> Result<(), JsValue> {
    yew::start_app::<App>();
    Ok(())
}


/// Any function defined with `wasm_bindgen` will be given a stub that allows
/// for calling it in Javascript
#[wasm_bindgen]
pub fn big_xd() -> Result<JsValue,JsValue> {
    console::log_1(&JsValue::from("BIG XD"));
    Ok(JsValue::from("HEY"))
}

