import { useEffect, useState } from "react";
import { X, Download, ZoomIn, ZoomOut } from "lucide-react";

function ImagePreview({ imageUrl, isOpen, onClose }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Reset loading state when image changes
  useEffect(() => {
    setImageLoaded(false);
    setIsZoomed(false);
  }, [imageUrl]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Extract filename from URL or use default
      const filename = imageUrl.split("/").pop() || "image.jpg";
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback to simple download
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = "image.jpg";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={handleOverlayClick}
    >
      {/* Action buttons */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 flex gap-2 sm:gap-3">
        {/* Zoom button */}
        <button
          onClick={() => setIsZoomed(!isZoomed)}
          className="group bg-transparent bg-opacity-10 hover:bg-opacity-20 backdrop-blur-sm text-white rounded-full p-2 sm:p-3 transition-all duration-200 hover:scale-110 border border-white border-opacity-20"
          title={isZoomed ? "Zoom out" : "Zoom in"}
        >
          {isZoomed ? (
            <ZoomOut
              size={18}
              className="sm:w-5 sm:h-5 group-hover:scale-110 transition-transform"
            />
          ) : (
            <ZoomIn
              size={18}
              className="sm:w-5 sm:h-5 group-hover:scale-110 transition-transform"
            />
          )}
        </button>

        {/* Download button */}
        <button
          onClick={handleDownload}
          className="group bg-transparent bg-opacity-10 hover:bg-opacity-20 backdrop-blur-sm text-white rounded-full p-2 sm:p-3 transition-all duration-200 hover:scale-110 border border-white border-opacity-20"
          title="Download image"
        >
          <Download
            size={18}
            className="sm:w-5 sm:h-5 group-hover:scale-110 transition-transform"
          />
        </button>

        {/* Close button */}
        <button
          onClick={onClose}
          className="group bg-transparent bg-opacity-10 hover:bg-opacity-20 backdrop-blur-sm text-white rounded-full p-2 sm:p-3 transition-all duration-200 hover:scale-110 border border-white border-opacity-20"
          title="Close preview"
        >
          <X
            size={18}
            className="sm:w-5 sm:h-5 group-hover:scale-110 transition-transform"
          />
        </button>
      </div>

      {/* Image container */}
      <div
        className={`relative w-full h-full flex items-center justify-center ${
          isZoomed ? "overflow-auto" : "overflow-hidden"
        }`}
      >
        {/* Loading spinner */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="loading loading-spinner loading-lg text-white"></div>
          </div>
        )}

        {/* Image */}
        <img
          src={imageUrl}
          alt="Preview"
          className={`${
            isZoomed
              ? "w-auto h-auto max-w-none max-h-none cursor-move"
              : "max-w-full max-h-full"
          } object-contain rounded-lg shadow-2xl transition-all duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          } ${isZoomed ? "scale-150" : "scale-100"}`}
          onClick={(e) => e.stopPropagation()}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(true)}
          style={{
            transformOrigin: "center center",
          }}
        />
      </div>
    </div>
  );
}

export default ImagePreview;
