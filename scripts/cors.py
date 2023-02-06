"""
Audio connected to a `MediaElementAudioSourceNode` needs to be
served with valid CORS settings.
*.googlevideo.com does not provide this by default.
"""
import os


class AddHeader:
    def response(self, flow):
        # One can techincally limit this to
        #   'https://lofy:20111 https://youtube.com'
        # but other sites that use YouTube resources could still break
        flow.response.headers["access-control-allow-origin"] = (
            os.environ["CORS"] if "CORS" in os.environ else "*"
        )


addons = [AddHeader()]
