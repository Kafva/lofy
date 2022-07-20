use reqwasm::http::Request;
use yew::prelude::*;
use log;

const PORT: i32 = 20111;


#[derive(Clone, Properties, PartialEq,Default)]
struct Xd {
    url: String
}

#[function_component(App)]
fn app() -> Html {


    let stream_url = use_state(|| Xd::default() );
    {
        use_effect_with_deps(move |_| {
            //let  stream_url = stream_url.clone();

            wasm_bindgen_futures::spawn_local(async move { 
                if stream_url.url.is_empty() {
                    let res = Request::new(format!("http://localhost:{PORT}/url").as_str()).send().await.unwrap()
                        .text().await.unwrap();
                    log::info!("This: {:?}", res);
                    stream_url.set( Xd{url: res});
                }
            });
            || ()
        }, ())
    }

    //let url = stream_url.url clone();

    html! {<>
            <h1>{ "XD" }</h1>
            //<audio controls=true src={ "http://localhost:7777/LEGION.m4a" }> 
            <audio controls=true src={ stream_url.url }> 
            </audio>
    </>}
    

    //let stream_url = use_state(|| vec![]);
    //{
    //    use_effect_with_deps(move |_| {
    //        let  stream_url = stream_url.clone();

    //        wasm_bindgen_futures::spawn_local(async move { 
    //            if stream_url.is_empty() {
    //                let res = Request::new(format!("http://localhost:{PORT}/url").as_str()).send().await.unwrap()
    //                    .text().await.unwrap();
    //                log::info!("This: {:?}", res);
    //                stream_url.set(vec![res]);
    //            }
    //        });
    //        || ()
    //    }, ())
    //}
    //html! {<>
    //        <h1>{ "XD" }</h1>
    //        //<audio controls=true src={ "http://localhost:7777/LEGION.m4a" }> 
    //        <audio controls=true src={ stream_url.get(0).unwrap() }> 
    //        </audio>
    //</>}

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
    wasm_logger::init(wasm_logger::Config::default());
    yew::start_app::<App>();
}
