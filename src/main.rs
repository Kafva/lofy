#![allow(unused_imports)] //dev
#![allow(non_upper_case_globals)]
use yew::prelude::*;
use yew::{Callback, function_component, html, use_state};

use wasm_bindgen::prelude::*;
use wasm_bindgen::{JsCast,JsValue};
use wasm_bindgen_futures::JsFuture;
use web_sys::console;
use web_sys::{Request, RequestInit, RequestMode, Response};

const PORT: i32 = 20111;

// https://yew.rs/docs/concepts/wasm-bindgen

#[function_component(App)]
fn app() -> Html {

    html! {
        <>
        <h1>{ format!("Running on {PORT}") }</h1>
        <Counter/>
        <Fetcher/>
        </>
    }
}

#[function_component(Fetcher)]
fn fetcher() -> Html {

    let val = use_state(|| "");
    //let response_url = use_ref(|| "");

    let resp = js_sys::eval("big_xd()").unwrap().to_owned().as_string().unwrap();
    //reqwest::blocking::get(format!("http://localhost:{PORT}/url").as_str()).unwrap().text().unwrap();
    //console::log_1(&JsValue::from(format!("{:#?}", resp)));

    let onclick = {
        let val = val.clone();
        Callback::from(move |_:MouseEvent| {


            //let resp = reqwest::blocking::get("https://httpbin.org/ip").unwrap().text().unwrap();


            //println!("{:#?}", resp);
            //let out = js_sys::eval("big_xd()").unwrap().to_owned().as_string().unwrap();
            //val.set( &resp )
        })
    };


    //use_ref(|| EventBus::bridge(Callback::from(move |_| {
    //    greeting.set(msg);
    //})));

    html! {
        <button>{ *val }</button>
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

//<iframe src="https://www.youtube.com/embed/hpF-WS0lU5A"/>
//<iframe src="https://www.youtube.com/embed/videoseries?list=PLeO-rHNGADqzCkDOyEUZbJMnuu5s9yIGh" allow="accelerometer; autoplay; encrypted-media; gyroscope;" autoplay=true ></iframe>

// https://www.youtube.com/watch?v=hpF-WS0lU5A


// curl -L $(yt-dlp --extract-audio -j --format bestaudio/best --audio-format m4a --skip-download 'https://www.youtube.com/watch?v=hpF-WS0lU5A'|jq -rM '.url') > out.webm
// What happens if we throw the webm url into an audio tag...
// if it can play it... then we are essentially good to go...

// We can embed localfiles directly over an http(s) link

// We can embed youtube playlists as iframes
// how are we going to map keypresses (<->) onto the iframe...
// How are we going to enable shuffle...
// The player times out Uncaught (in promise) TIMEOUT
// There is kind of an API: https://developers.google.com/youtube/iframe_api_reference
//
// It is all pretty non-stable
//
// Maybe we should just have the server use yt-dl JIT (potentially over VPN)...
// https://github.com/mps-youtube/pafy, yt-dlp is better maintained
// This can extract streams for us
//
// Or maaaaaaaybe just use stock YT whenever we actually want to use it...

fn main() {
    yew::start_app::<App>();
}

/// Any function defined with `wasm_bindgen` will be given a stub that allows
/// for calling it in Javascript
#[wasm_bindgen]
pub fn big_xd() -> Result<JsValue,JsValue> {
    Ok(JsValue::from("HEY"))
    //console::log_1(&JsValue::from("BIG XD"));
}

//#[wasm_bindgen]
//pub async fn run(repo: String) -> Result<JsValue, JsValue> {
//    let mut opts = RequestInit::new();
//    opts.method("GET");
//    opts.mode(RequestMode::Cors);
//
//    let url = format!("https://api.github.com/repos/{}/branches/master", repo);
//
//    let request = Request::new_with_str_and_init(&url, &opts)?;
//
//    request
//        .headers()
//        .set("Accept", "application/vnd.github.v3+json")?;
//
//    let window = web_sys::window().unwrap();
//    let resp_value = JsFuture::from(window.fetch_with_request(&request)).await?;
//
//    // `resp_value` is a `Response` object.
//    assert!(resp_value.is_instance_of::<Response>());
//    let resp: Response = resp_value.dyn_into().unwrap();
//
//    // Convert this other `Promise` into a rust `Future`.
//    let json = JsFuture::from(resp.json()?).await?;
//}
