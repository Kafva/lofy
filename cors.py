"""
Audio connected to a `MediaElementAudioSourceNode` needs to be
served with valid CORS settings.
*.googlevideos.com does not provide this by default.

    mitmproxy --ssl-insecure --intercept "~d googlevideos.com"  --scripts cors.py

"""

class AddHeader:
    def response(self, flow):
        flow.response.headers["Access-Control-Allow-Origin"] = \
            "https://lofy:20111"


addons = [AddHeader()]

