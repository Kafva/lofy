use yew::prelude::*;
use yew::{Component, Context, html, Html, Properties};
use yew::{Callback, function_component, use_state};

use wasm_bindgen::prelude::*;
use wasm_bindgen::{JsCast,JsValue};
use wasm_bindgen_futures::spawn_local;

use web_sys::{console,MouseEvent};
use js_sys;

use crate::config::PORT;
use crate::log;
use crate::util::get_request;
//============================================================================//


#[derive(PartialEq, Properties, Default)]
pub struct Props {
    stream_url: String
}

pub struct App;

impl Component for App {
    type Message = ();
    type Properties = ();

    fn create(_: &Context<Self>) -> Self {
        App
    }
    fn view(&self, _ctx: &Context<Self>) -> Html {
        html! {
            <>
            <h1>{ format!("Running on {PORT}") }</h1>
            <Counter/>
            <FetchUrl/>
            </>
        }
    }
}

pub struct Track;

impl Component for Track {
    type Message = ();
    type Properties = Props;

    fn create(_: &Context<Self>) -> Self {
        Track
    }

    // Called when the component receives a message
    fn update(&mut self, _ctx: &Context<Self>, _msg: Self::Message) -> bool {
            //spawn_local(async move {
            //    let string = get_request().await.unwrap();
            //    //self.url = string.as_string().unwrap();
            //    console::log_1(&string.into());
            //});        
            false
    }


    // Called after `view()` has completed
    fn rendered(&mut self, _ctx: &Context<Self>, first_render: bool) {
        if first_render {
            spawn_local(async {
                //let string = get_request().await.unwrap();
                //console::log_1(&string.into());
            });
        }
    }

    fn view(&self, ctx: &Context<Self>) -> Html {
        html! {
            <>
            <p> { "Track" } </p>
            <p> { &ctx.props().stream_url } </p> 
            </>
        }
    }
}


#[function_component(Counter)]
fn counter() -> Html {
    // `use_state` will trigger a re-render everytime a new value is encountered
    // for `cnt`.
    let cnt = use_state(|| 0);
    let onclick = {
        let cnt = cnt.clone();
        Callback::from(move |_:MouseEvent| cnt.set(*cnt + 1))
    };

    // Calls to console log with different argument counts require their own
    // bindings
    log!("Rendering counter component {}...", *cnt);

    html! {
        <button {onclick}>{ *cnt }</button>
    }
}

#[function_component(FetchUrl)]
fn fetch_url() -> Html {
    let url = use_state(|| String::default());
    {
        let url = url.clone();

        use_effect_with_deps(move |_| {
            // Called after inital render finishes
            let url = url.clone();

            spawn_local(async move {
               let string = get_request().await.unwrap();
               log!(&string);

               url.set(string.as_string().unwrap().trim().to_string());
            }); 
            
            // Clean up after render
            || ()
        }, 
            () // dependents on the effect (none)
        );
    }


    html! { <>
        <p> { "this" } </p>
        <audio controls=true src={ (*url).clone() }/>
        <p> {  (*url).clone() } </p>
        </>
    }
}
