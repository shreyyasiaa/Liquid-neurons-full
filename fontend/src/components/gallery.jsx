import React, { useRef, useState, useEffect } from "react";
import axios from 'axios';
import anno from '../annotated_image.jpg';


export const Gallery = (props) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [annotatedImage, setAnnotatedImage] = useState(null);
  const [count, setCount] = useState(null);
  const [isCameraStarted, setIsCameraStarted] = useState(false);


  const toggleCamera = () => {
    if (!isCameraStarted) {
      startCamera();
    } else {
      takePicture();
    }
  };

  const startCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        setIsCameraStarted(true);
      })
      .catch((err) => console.error('Error accessing the camera:', err));
  };

  const takePicture = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const video = videoRef.current;

    // Set canvas dimensions to match video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current frame of the video onto the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas image to base64 data URL
    const image = canvas.toDataURL('image/jpeg');

    // Set the captured image in state
    setCapturedImage(image);

    // Call the function to send the image to the backend
    sendImageToBackend(image);
  };

  const sendImageToBackend = async (image) => {
    try {
      // Send the base64 URL to the backend
      const response = await axios.post('http://127.0.0.1:5000/upload', { image: image }, { mode: 'no-cors' });
      console.log('Image sent to the backend successfully:', response.data);

      // Set the annotated image URL in state
      setAnnotatedImage(response.data.annotatedImagePath);
      setCount(response.data.count);
      
      // console.log("Annotated Image:",annotatedImage);
      // console.log("Count:", count);

    } catch (error) {
      console.error('Error sending image to the backend:', error);
      // Optionally, handle the error
    }
  };


  
  return (
    <div id="portfolio" className="text-center">
      <div className="container">
        <div className="section-title">
          <h2>Demo</h2>
          <p>Industrial pipe counting using AI for inventory and invoice.</p>
        </div>
        <div className="row">
          <div className="demo">
            <video ref={videoRef} autoPlay />
            <canvas ref={canvasRef} width={640} height={480} style={{ display: "none" }} />
          </div>
          <button onClick={toggleCamera}>{isCameraStarted ? "Capture Image" : "Start Camera"}</button>
        </div>
        {capturedImage && (
          <div>
            <h3>Captured Image</h3>
            <img src={capturedImage} alt="Captured" />
          </div>
        )}
        {annotatedImage && (
          <div>
            <h3>Annotated image</h3>
            <img src={anno} alt="Annotated" />
            <p><h1>Pipe count: {count}</h1></p>
          </div>
        )}
      </div>
    </div>
  );
};
