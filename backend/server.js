const express = require('express');
const app = express();
const webrtc = require('wrtc');
const cors = require('cors');

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

let senderStream = null;
let senderStream2 = null;
let peer1 = null;
let peer2 = null;

const handleTrackEvent = (e, peer) => {
    console.log("handleTrackEvent");
    e.streams[0].getTracks().forEach(track => console.log(track.id, track.kind, track.enabled, track.readyState));
    senderStream = e.streams[0];
};

const handleTrackEvent2 = (e, peer) => {
    console.log("handleTrackEvent2");
    e.streams[0].getTracks().forEach(track => console.log(track.id, track.kind, track.enabled, track.readyState));
    senderStream2 = e.streams[0];
};

app.get("/", (req, res) => {
    res.send("Server is running");
});

// upload1
app.post("/upload1", async ({body}, res) => {
    console.log("one upload");
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
    peer1 = peer;
    // console.log("consumer's stream", senderStream);
    // senderStream.getTracks().forEach(track => {
    //     console.log("adding track", track.id, track.kind, track.enabled, track.readyState);
    //     peer.addTrack(track, senderStream)
    // });
    // const answer = await peer.createAnswer();
    // await peer.setLocalDescription(answer);
    // const payload = {
    //     sdp: peer.localDescription
    // };
    // res.json(payload);
    const payload = {
        sdp: null
    };
    res.json(payload);
    });

// upload2
app.post("/upload2", async ({body}, res) => {
    console.log("two upload");
    const peer = new webrtc.RTCPeerConnection(
        {
            iceServers: [
                {
                    urls: "stun:stun.stunprotocol.org"
                }
            ]
        });
    peer.ontrack = (e) => handleTrackEvent2(e, peer);
    const desc = new webrtc.RTCSessionDescription(body.sdp);
    await peer.setRemoteDescription(desc);
    peer2 = peer;
    // console.log("consumer's stream", senderStream);
    // senderStream2.getTracks().forEach(track => {
    //     console.log("adding track", track.id, track.kind, track.enabled, track.readyState);
    //     peer.addTrack(track, senderStream2)
    // });
    // const answer = await peer.createAnswer();
    // await peer.setLocalDescription(answer);
    // const payload = {
    //     sdp: peer.localDescription
    // };
    // res.json(payload);
    const payload = {
        sdp: null
    };
    res.json(payload);
    });

// client 1 wants to receive a stream
app.post("/startstreaming1", async ({body}, res) => {
    console.log("startstreaming1");
    // console.log("consumer's stream", senderStream);
    senderStream2.getTracks().forEach(track => {
        console.log("adding track", track.id, track.kind, track.enabled, track.readyState);
        peer1.addTrack(track, senderStream2);
    });
    const answer = await peer1.createAnswer();
    await peer1.setLocalDescription(answer);
    const payload = {
        sdp: peer1.localDescription
    };
    res.json(payload);
});

// client 1 wants to receive a stream
app.post("/startstreaming2", async ({body}, res) => {
    console.log("startstreaming2");
    // console.log("consumer's stream", senderStream);
    senderStream.getTracks().forEach(track => {
        console.log("adding track", track.id, track.kind, track.enabled, track.readyState);
        peer2.addTrack(track, senderStream);
    });
    const answer = await peer2.createAnswer();
    await peer2.setLocalDescription(answer);
    const payload = {
        sdp: peer2.localDescription
    };
    res.json(payload);
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
    // console.log("consumer's stream", senderStream);
    senderStream.getTracks().forEach(track => {
        console.log("adding track", track.id, track.kind, track.enabled, track.readyState);
        peer.addTrack(track, senderStream)
    });
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    const payload = {
        sdp: peer.localDescription
    };
    res.json(payload);
});

// client wants to broadcast
app.post("/broadcast", async ({body}, res) => {
    console.log("broadcast");
    const peer = new webrtc.RTCPeerConnection({
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
});

app.listen(3000, () => {
    console.log("listening on port 3000");
});