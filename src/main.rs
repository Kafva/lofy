use yew::prelude::*;

#[function_component(App)]
fn app() -> Html {
    html! {<>
            <h1>{ "XD" }</h1>
            <audio controls=true src={ "http://localhost:7777/LEGION.m4a" }> 
            </audio>
            //<iframe src="https://www.youtube.com/embed/hpF-WS0lU5A"/>
            <iframe src="https://www.youtube.com/embed/videoseries?list=PLeO-rHNGADqzCkDOyEUZbJMnuu5s9yIGh" allow="accelerometer; autoplay; encrypted-media; gyroscope;" autoplay=true ></iframe>
    </>}
}

// https://www.youtube.com/watch?v=hpF-WS0lU5A


// curl -L $(yt-dlp --extract-audio -j --format bestaudio/best --audio-format m4a --skip-download 'https://www.youtube.com/watch?v=hpF-WS0lU5A'|jq -rM '.url') > out.webm
// What happens if we throw the webm url into a audio tag...

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
