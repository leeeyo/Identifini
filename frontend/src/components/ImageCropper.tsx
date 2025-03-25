import React, { useState, useRef } from 'react';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropperProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
  onCropComplete: (croppedImageUrl: string) => void;
  aspectRatio?: number;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  isOpen,
  imageUrl,
  onClose,
  onCropComplete,
  aspectRatio = 1
}) => {
  const [crop, setCrop] = useState<Crop>(({ 
    unit: '%',
    width: 80,
    height: 80,
    x: 10,
    y: 10,
    aspect: aspectRatio
  } as Crop & { aspect: number }));
  
  const imageRef = useRef<HTMLImageElement | null>(null);

  const onImageLoaded = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    imageRef.current = img;
    console.log("Image loaded", img);
    return false;
  };
  

  // Crop the image to dataURL
  const getCroppedImg = (): string => {
    const img = imageRef.current;
    if (!img) return '';
  
    const canvas = document.createElement('canvas');
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;
    const pixelRatio = window.devicePixelRatio;
  
    const croppedWidth = (crop.width || 0) * scaleX;
    const croppedHeight = (crop.height || 0) * scaleY;
  
    canvas.width = croppedWidth * pixelRatio;
    canvas.height = croppedHeight * pixelRatio;
  
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
  
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';
  
    const cropX = (crop.x || 0) * scaleX;
    const cropY = (crop.y || 0) * scaleY;
  
    ctx.drawImage(
      img,
      cropX,
      cropY,
      croppedWidth,
      croppedHeight,
      0,
      0,
      croppedWidth,
      croppedHeight
    );
  
    const dataUrl = canvas.toDataURL('image/jpeg');
    console.log("Cropped image data URL:", dataUrl);
    return dataUrl;
  };

  const handleCropComplete = () => {
    const croppedImageUrl = getCroppedImg();
    if (croppedImageUrl) {
      onCropComplete(croppedImageUrl);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="cropper-modal">
      <div className="cropper-content">
        <h3>Crop Your Image</h3>
        {imageUrl && (
            <ReactCrop
  crop={crop}
  onChange={(newCrop) => setCrop(newCrop)}
  onComplete={(c) => {
    console.log("Crop complete:", c);
    setCrop(c);
  }}
  keepSelection={true}
>
  <img src={imageUrl || "/placeholder.svg"} onLoad={onImageLoaded} alt="Crop preview" />
</ReactCrop>

        )}
        <div className="cropper-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleCropComplete}>Crop & Save</button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
