import { useEffect, useState } from "react";
import { X, Download, Play, Pause } from "lucide-react";

function VideoPreview({ videoUrl, isOpen, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const filename = videoUrl.split("/").pop() || "video.mp4";
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      const link = document.createElement("a");
      link.href = videoUrl;
      link.download = "video.mp4";
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
        {/* Download button */}
        <button
          onClick={handleDownload}
          className="group bg-transparent bg-opacity-10 hover:bg-opacity-20 backdrop-blur-sm text-white rounded-full p-2 sm:p-3 transition-all duration-200 hover:scale-110 border border-white border-opacity-20"
          title="Download video"
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

      {/* Video container */}
      <div className="relative w-full h-full flex items-center justify-center">
        <video
          src={videoUrl}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          controls
          autoPlay
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
}

export default VideoPreview;
