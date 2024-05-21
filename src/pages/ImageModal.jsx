import React from "react";
import "./ImageModal.css";

const ImageModal = ({ imageSrc, onClose }) => {
  return (
    <div className="image-modal">
      <div className="image-modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <img src={imageSrc} alt="Enlarged" className="enlarged-image" />
      </div>
    </div>
  );
};

export default ImageModal;
