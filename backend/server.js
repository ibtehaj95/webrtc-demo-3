const express = require('express');
const app = express();
const webrtc = require('wrtc');
const cors = require('cors');

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

let senderStream = null;

const handleTrackEvent = (e, peer) => {
    senderStream = e.streams[0];
};

app.get("/", (req, res) => {
    res.send("Server is running");
});

// client wants to receive a stream
app.post("/consumer", async ({body}, res) => {
    console.log("consumer");
    const peer = new webrtc.RTCPeerConnection(
        {
            iceServers: [
                {
                    urls: "stun:stun.stunprotocol.org"
                }
            ]
        });
    const desc = new webrtc.RTCSessionDescription(body.sdp);
    await peer.setRemoteDescription(desc);
    const answer = await peer.createAnswer();
    senderStream.getTracks().forEach(track => {
        console.log("addTrack", track, senderStream);
        peer.addTrack(track, senderStream)
    });
    await peer.setLocalDescription(answer);
    const payload = {
        sdp: peer.localDescription
    };
    res.json(payload);
    });

// client wants to broadcast
app.post("/broadcast", async ({body}, res) => {
    console.log("broadcast");
    const peer = new webrtc.RTCPeerConnection(
        {
            iceServers: [
                {
                    urls: "stun:stun.stunprotocol.org"
                }
            ]
        });
    peer.ontrack = (e) => handleTrackEvent(e, peer);
    const desc = new webrtc.RTCSessionDescription(body.sdp);
    await peer.setRemoteDescription(desc);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    const payload = {
        sdp: peer.localDescription
    };
    res.json(payload);
    }
);

app.listen(3000, () => {
    console.log("listening on port 3000");
});