"""
Audio connected to a `MediaElementAudioSourceNode` needs to be
served with valid CORS settings.
*.googlevideos.com does not provide this by default.

    pip3.10 install --user mitmproxy
    CORS=https://lofy:20111 mitmdump --ssl-insecure --intercept "~d googlevideos.com"  --scripts cors.py
"""
import os

class AddHeader:
    def response(self, flow):
        flow.response.headers["access-control-allow-origin"] = \
            os.environ["CORS"]

addons = [AddHeader()]
