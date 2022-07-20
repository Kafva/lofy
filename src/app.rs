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


async fn async_stub() -> String { String::from("Rendered") }

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

        //let stream_url = use_state(|| "".to_string());
        //{
        //    let stream_url = stream_url.clone();
        //    spawn_local(async move {

        //        let string = get_request().await.unwrap();


        //        //let mut string = async_stub().await;
        //        //string.push_str(", async track!");
        //        stream_url.set(string.as_string().unwrap().to_owned());
        //    });
        //}


        html! {
            <>
            <h1>{ format!("Running on {PORT}") }</h1>
            <Counter/>
            <Test/>
            //<Track stream_url="http://localhost:7777/LEGION.m4a"/>
            //<Track stream_url="" />

            </>
        }
    }
}


pub struct Track {
    url: String
}

impl Component for Track {
    type Message = ();
    type Properties = Props;

    fn create(_: &Context<Self>) -> Self {
        //let stream_url = use_state(|| "".to_string());
        
        //let stream_url = stream_url.clone();
        //spawn_local(async move {

        //    let string = get_request().await.unwrap();


        //    //let mut string = async_stub().await;
        //    //string.push_str(", async track!");
        //    stream_url.set(string.as_string().unwrap().to_owned());
        //});
        

        Track { url: "".to_string() }
    }

    // Called when the component receives a message
    fn update(&mut self, ctx: &Context<Self>, _msg: Self::Message) -> bool {
        
            //spawn_local(async move {
            //    let string = get_request().await.unwrap();
            //    //self.url = string.as_string().unwrap();
            //    console::log_1(&string.into());
            //});        
            false
    }


    // Called after `view()` has completed
    fn rendered(&mut self, ctx: &Context<Self>, first_render: bool) {
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



#[function_component(Test)]
fn test() -> Html {
    let videos:Vec<String> = vec![ String::default() ];
    let videos = use_state(|| vec![]);
    {
        let videos = videos.clone();

        use_effect_with_deps(move |_| {
            let videos = videos.clone();
            spawn_local(async move {
               let string = get_request().await.unwrap();
                //let fetched_videos: Vec<Video> = Request::get("https://yew.rs/tutorial/data.json")
                //    .send()
                //    .await
                //    .unwrap()
                //    .json()
                //    .await
                //    .unwrap();
                videos.set(vec![ string ]);
            });
            || ()
        }, ());
    }


    html! { <>
        <p> { "this" } </p>
        if videos.len() > 0 {
            <p> { videos.get(0).unwrap().as_string().unwrap() } </p>

        }
        </>
    }
}
