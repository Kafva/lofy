/** Toggle `console.log()` output of worker */
const DEBUG = true

let NEXT_YT_URL = ""
let NEXT_TRACK_ID = ""

onmessage = (e:MessageEvent) => {
    const msg = e.data
    Log("Got message", msg)

    if (msg !== undefined && msg.currentTrackId !== undefined) {
        if (NEXT_TRACK_ID == msg.currentTrackId) {
            // Respond with the currently stored next track ID
            // if it matches the requested ID
            const toSend = NEXT_YT_URL
            NEXT_TRACK_ID = ""
            NEXT_YT_URL = ""
            Log(`Posting prefetched URL (${msg.currentTrackId}): ${toSend}`)
            postMessage(toSend)

        } else {
            // Fetch the requested current ID...
            fetch(`/yturl/${msg.currentTrackId}`)
                .then( (r:Response) => r.text())
                .then( (d:string) => {
                    // ...and post the response
                    Log(`Posting newly fetched URL (${msg.currentTrackId}): '${d}'`)
                    postMessage(d)
                })
        }
        // Prefetch the next ID
        fetch(`/yturl/${msg.nextPredictedTrackId}`)
            .then( (r:Response) => r.text())
            .then( (d:string) => {
                if (d !== undefined && d !== "") {
                    Log(`Saving prefetched URL (${msg.nextPredictedTrackId}): ${d}`)
                    NEXT_YT_URL = d
                    NEXT_TRACK_ID = msg.nextPredictedTrackId
                }
            })
    }
}

const Log = (...args: any) => {
    if (DEBUG) {
        console.log("%c WORKER ", 'background: #299446; color: #f5e4f3', ...args)
    }
}

export {}
