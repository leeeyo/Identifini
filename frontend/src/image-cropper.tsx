// "use client";

// import React, { useState, useRef } from "react";
// import { Button } from "@/components/ui/button";
// import { X } from 'lucide-react';
// import Cropper from "react-cropper";
// import "cropperjs/dist/cropper.css";

// interface ImageCropperProps {
//   image: string;
//   onCrop: (croppedImage: string) => void;
//   onCancel: () => void;
// }

// export function ImageCropper({ image, onCrop, onCancel }: ImageCropperProps) {
//   const cropperRef = useRef<HTMLImageElement>(null);
//   const [cropper, setCropper] = useState<Cropper>();

//   const handleCrop = () => {
//     if (cropper) {
//       const croppedCanvas = cropper.getCroppedCanvas({
//         width: 300,
//         height: 300,
//       });
      
//       const croppedImage = croppedCanvas.toDataURL("image/jpeg", 0.8);
//       onCrop(croppedImage);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//       <div className="bg-background rounded-lg max-w-3xl w-full max-h-[90vh] flex flex-col">
//         <div className="flex justify-between items-center p-4 border-b">
//           <h3 className="text-lg font-semibold">Crop Your Image</h3>
//           <Button variant="ghost" size="icon" onClick={onCancel}>
//             <X className="h-5 w-5" />
//           </Button>
//         </div>
        
//         <div className="flex-1 overflow-auto p-4">
//           <Cropper
//             src={image}
//             style={{ height: 400, width: "100%" }}
//             aspectRatio={1}
//             guides={true}
//             ref={cropperRef}
//             viewMode={1}
//             onInitialized={(instance: Cropper) => setCropper(instance)}
//           />
//         </div>
        
//         <div className="p-4 border-t flex justify-end gap-2">
//           <Button variant="outline" onClick={onCancel}>
//             Cancel
//           </Button>
//           <Button onClick={handleCrop}>
//             Crop
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }
