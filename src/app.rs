use yew::prelude::*;
use yew::{Component, Context, html, Html, Properties};
use yew::{Callback, function_component, use_state};

use wasm_bindgen::prelude::*;
use wasm_bindgen::{JsCast,JsValue};

use web_sys::{console,MouseEvent};
use js_sys;

use crate::config::PORT;
//============================================================================//


#[derive(PartialEq, Properties, Default)]
pub struct Props;

pub struct App;

impl Component for App {
    type Message = ();
    type Properties = Props;

    fn create(_: &Context<Self>) -> Self {
        App
    }

    fn update(&mut self, _ctx: &Context<Self>, _msg: Self::Message) -> bool {
        false
        //match msg {
        //    Msg::SetInputEnabled(enabled) => {
        //        if self.input_enabled != enabled {
        //            self.input_enabled = enabled;
        //            true // Re-render
        //        } else {
        //            false
        //        }
        //    }
        //}
    }


    fn view(&self, _ctx: &Context<Self>) -> Html {
        html! {
            <>
            <h1>{ format!("Running on {PORT}") }</h1>
            <Counter/>
            </>
        }
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
        &JsValue::from(format!("Rendering counter componenet {}...", *cnt))
    );

    html! {
        <button {onclick}>{ *cnt }</button>
    }
}

