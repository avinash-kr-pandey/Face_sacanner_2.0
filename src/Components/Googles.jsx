import "./Googles.css";
import React, { useState } from "react";
import sum3 from "../assets/images/sunglass-3.png";
import sum4 from "../assets/images/glass-4.png";
import sum5 from "../assets/images/glass-3.png";
import sum6 from "../assets/images/glass-2.png";
import sum7 from "../assets/images/glass-1.png";
import sum8 from "../assets/images/glass-3.png";
import FaceModal from "../pages/FaceMoal";
import ImageModal from "../pages/ImageModal";

function Googles({ isShowModal, setIsShowModal }) {
  const glassesImages = [sum3, sum4, sum5, sum6, sum7, sum8];
  const [capturedImages, setCapturedImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageCapture = (images) => {
    setIsShowModal(false);
    setCapturedImages(images);
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  return (
    <>
      {isShowModal && (
        <FaceModal
          glassesImages={glassesImages}
          handleImageCapture={handleImageCapture}
        />
      )}
      <section className="cardbox" style={{ paddingTop: "10vh" }}>
        {capturedImages.map((image, index) => (
          <div className="card" key={index} style={{ boxShadow: "none" }}>
            <div
              className="imgbox"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "10px",
                height: "100%",
              }}
            >
              {image && (
                <img
                  className="boximg"
                  src={image}
                  alt={`Captured ${index}`}
                  onClick={() => handleImageClick(image)} // Handle click to enlarge image
                  style={{
                    boxShadow: "none",
                    border: "none",
                    width: "100%",
                    height: "auto",
                    borderRadius: "20px",
                    cursor: "pointer", // Change cursor to pointer to indicate it's clickable
                  }}
                />
              )}
            </div>
            <div className="content">
              <p className="name">{image ? "Captured Image" : "Empty"}</p>
            </div>
          </div>
        ))}
      </section>

      {selectedImage && <ImageModal imageSrc={selectedImage} onClose={closeModal} />}
    </>
  );
}

export default Googles;
