import React, { useEffect, useState, useRef } from "react";
import Button from '@mui/material/Button';
import { TextField } from "@mui/material";
import "./App.scss";
import io from "socket.io-client";

function App (){

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const pcRef = useRef(null);
    const textRef = useRef(null);
    const [cameraOn, setCameraOn] = useState(false);

    const handleStartWebcam = () => {
        getUserMedia(); // get the user's webcam/microphone stream
    };

    const handleStopWebcam = () => {
        localVideoRef.current.srcObject.getTracks().forEach(track => track.stop()); // stop all tracks in the stream
        localVideoRef.current.srcObject = null; // remove the stream from the video element
        setCameraOn(false); // enable the start camera button
    };

    const userAllMediaDevices = () => {
        navigator.mediaDevices.enumerateDevices()
            .then(devices => {
                devices.forEach(device => {
                    console.log(device.kind.toUpperCase(), device.label);
                })
            })
            .catch(err => {
                console.error(err);
            });
    };

    const getUserMedia = () => {
        const constraints = { video: true, audio: false }; // specify what kind of streams we want
        // prompt the user for permission to use specified devices
        // note that if a user has multiple cameras/microphones, we can find those out (enumerate) specify which ones to use, otherwise OS default will be used
        // https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API
        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                localVideoRef.current.srcObject = stream; // set the source of the video element to the captured stream, this is for you to see yourself
                stream.getTracks().forEach(track => pcRef.current.addTrack(track, stream)); // add the stream to the RTCPeerConnection object, this is for the other party to see you
                // stream.getTracks().forEach(track => console.log(track)); // print the tracks in the stream
                // remoteVideoRef.current.srcObject = stream; // only for testing
                setCameraOn(true); // disable the start camera button
            })
            .catch(error => {
                console.error("Error accessing media devices.", error);
            });
    };

    useEffect(() => {

        const pc = new RTCPeerConnection(null); // create a new RTCPeerConnection
        
        pc.onicecandidate = (e) => {
            if (e.candidate) {
                console.log(JSON.stringify(e.candidate));
            }
        };
        
        pc.oniceconnectionstatechange = (e) => {
            console.log("ICE Connection State Change", e); // connected, disconnected, failed, closed
        };

        pc.ontrack = (e) => {
            remoteVideoRef.current.srcObject = e.streams[0]; // set the source of the video element to the received stream
        }

        pcRef.current = pc; // store the RTCPeerConnection object in the ref, we are using pcRef like a global variable
        // from this point on, pc will not be addressed directly, but rather through pcRef.current, because it doesn't exist outside of this useEffect block

    }, []);

    return(
        <div className="App">
            <div className="title">Video Streaming App</div>
            <div className="videos-container">
                <div className="names-row">
                    <div className="name">Local Stream</div>
                    <div className="name">Remote Stream</div>
                </div>
                <div className="videos-row">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        className="local-video"
                        style={{
                            width: 480, 
                            height: 300,
                            margin: 5,
                            backgroundColor: "black"
                        }}
                    />
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        muted
                        className="remote-video"
                        style={{
                            width: 480, 
                            height: 300,
                            margin: 5,
                            backgroundColor: "black"
                        }}
                    />
                </div>
            </div>
            <div className="inputs-container">
                <Button variant="contained" color="primary" onClick={userAllMediaDevices} sx={{margin: 1, width: "max-content"}}>
                    Show All Media Devices
                </Button>
                <Button variant="contained" color="primary" onClick={cameraOn === true ? handleStopWebcam : handleStartWebcam} sx={{margin: 1, width: "max-content"}}>
                    {cameraOn === true ? "Stop Webcam" : "Start Webcam"}
                </Button>
                <TextField
                        inputRef={textRef}
                        multiline
                        rows={4}
                        variant="outlined"
                        sx={{ margin: 1}}
                />
            </div>
        </div>
    );
}

    export default App;
