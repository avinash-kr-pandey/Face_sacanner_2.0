import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";

const FaceModal = ({ glassesImages = [], handleImageCapture }) => {
  const webcamRef = useRef(null);
  const [faceMesh, setFaceMesh] = useState(null);
  const [glassesTransform, setGlassesTransform] = useState({ x: 0, y: 0, scale: 1, rotation: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [initialDistance, setInitialDistance] = useState(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        const faceMeshModel = new FaceMesh({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });
        faceMeshModel.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        faceMeshModel.onResults(onResults);
        setFaceMesh(faceMeshModel);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading face mesh model:", error);
        setIsLoading(false);
      }
    };

    loadModel();
  }, []);

  useEffect(() => {
    if (faceMesh && webcamRef.current) {
      const video = webcamRef.current.video;
      if (video) {
        const camera = new Camera(video, {
          onFrame: async () => {
            await faceMesh.send({ image: video });
          },
          width: 640,
          height: 480,
        });
        camera.start();
      }
    }
  }, [faceMesh]);

  const onResults = (results) => {
    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
      setIsFaceDetected(false);
      return;
    }

    const faceLandmarks = results.multiFaceLandmarks[0];

    if (!faceLandmarks || !Array.isArray(faceLandmarks) || faceLandmarks.length < 34) {
      setIsFaceDetected(false);
      return;
    }

    setIsFaceDetected(true);

    const leftEye = faceLandmarks[33];
    const rightEye = faceLandmarks[263];
    const leftEar = faceLandmarks[130];
    const rightEar = faceLandmarks[359];

    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;
    const glassesWidth = (rightEar.x - leftEar.x) * videoWidth;

    const glassesPosition = {
      x: (1 - (leftEye.x + rightEye.x) / 2) * videoWidth, // Adjust for mirrored video
      y: (leftEye.y + rightEye.y) / 2 * videoHeight,
    };

    const currentDistance = Math.sqrt(Math.pow(rightEye.x - leftEye.x, 2) + Math.pow(rightEye.y - leftEye.y, 2));
    if (!initialDistance) {
      setInitialDistance(currentDistance);
    }

    // Calculate the scale factor based on the initial distance between the eyes
    const scaleFactor = glassesWidth / 190; // Assuming the original glasses image width is 190 pixels

    const deltaX = rightEye.x - leftEye.x;
    const deltaY = rightEye.y - leftEye.y;
    const rotation = -Math.atan2(deltaY, deltaX) * (180 / Math.PI);

    setGlassesTransform({
      x: glassesPosition.x,
      y: glassesPosition.y,
      scale: scaleFactor,
      rotation: rotation,
    });
  };

  const captureImage = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      const capturedImages = await processCapturedImages(imageSrc);
      handleImageCapture(capturedImages);
    }
  };

  const processCapturedImages = async (imageSrc) => {
    const img = new Image();
    img.src = imageSrc;

    return new Promise((resolve) => {
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, img.width, img.height);

        const promises = glassesImages.map(glassesImage =>
          new Promise((resolve) => {
            const glassesImg = new Image();
            glassesImg.src = glassesImage;
            glassesImg.onload = () => {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0, img.width, img.height);

              ctx.save();
              ctx.translate(glassesTransform.x, glassesTransform.y);
              ctx.rotate((glassesTransform.rotation * Math.PI) / 180);
              ctx.scale(glassesTransform.scale, glassesTransform.scale);
              ctx.drawImage(glassesImg, -glassesImg.width / 2, -glassesImg.height / 2, glassesImg.width, glassesImg.height);
              ctx.restore();

              resolve(canvas.toDataURL());
            };
          })
        );

        Promise.all(promises).then((results) => {
          resolve(results);
        });
      };
    });
  };

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          position: "relative",
          margin: "0 auto",
          width: "640px",
          height: "480px",
        }}
      >
        {isLoading && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(255, 255, 255, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 2,
            }}
          >
            <h3 style={{ paddingTop: "50px" }}>Loading...</h3>
          </div>
        )}

        {!isLoading && (
          <>
            <Webcam
              ref={webcamRef}
              audio={false}
              autoPlay
              playsInline
              style={{ width: "640px", height: "480px", borderRadius: "30%" }}
              mirrored={true}
              screenshotFormat="image/jpeg"
            />
            <div style={{ marginLeft: '200px' }}>
              <button style={{ height: '30px', width: "50%", borderRadius: '20px', backgroundColor: 'green' }} onClick={captureImage}>Take Image</button>
            </div>
          </>
        )}
        {isFaceDetected && glassesTransform && glassesImages.length > 0 && (
          <img
            src={glassesImages[0]}
            alt="Selected Glasses"
            style={{
              position: "absolute",
              top: glassesTransform.y,
              left: glassesTransform.x,
              transform: `translate(-50%, -50%) scale(${glassesTransform.scale}) rotate(${glassesTransform.rotation}deg)`,
              transition: "transform 0.1s",
            }}
          />
        )}
      </div>
    </div>
  );
};

export default FaceModal;
