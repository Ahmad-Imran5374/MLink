import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X, Video, Paperclip, Reply } from "lucide-react";
import toast from "react-hot-toast";

function MessageInput() {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const { sendMessage, replyTo, clearReplyTo, selectedUser } = useChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size should be less than 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setVideoPreview(null); // Clear video if image is selected
    };
    reader.readAsDataURL(file);
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Please select a video file");
      return;
    }

    // Check file size (max 50MB for videos)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Video size should be less than or equal to 25MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setVideoPreview(reader.result);
      setImagePreview(null); // Clear image if video is selected
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeVideo = () => {
    setVideoPreview(null);
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview && !videoPreview) return;

    // Only show uploading state for media uploads
    const hasMedia = imagePreview || videoPreview;
    if (hasMedia) {
      setIsUploading(true);
    }

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
        video: videoPreview,
        replyTo: replyTo?._id || null,
      });

      setText("");
      setImagePreview(null);
      setVideoPreview(null);
      clearReplyTo();
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (videoInputRef.current) videoInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message: ", error);
      toast.error("Failed to send message");
    } finally {
      if (hasMedia) {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="p-4 w-full">
      {/* Reply preview */}
      {replyTo && (
        <div className="mb-3 p-3 bg-base-200 rounded-lg border-l-4 border-primary">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Reply size={14} className="text-primary" />
                <span className="text-xs font-semibold text-primary">
                  Replying to{" "}
                  {replyTo.senderId === selectedUser?._id
                    ? selectedUser?.fullName
                    : "yourself"}
                </span>
              </div>
              {replyTo.isDeleted ? (
                <div className="text-xs italic opacity-50">Message deleted</div>
              ) : (
                <div className="text-sm opacity-70 line-clamp-2">
                  {replyTo.text ||
                    (replyTo.image && "📷 Photo") ||
                    (replyTo.video && "🎥 Video")}
                </div>
              )}
            </div>
            <button
              onClick={clearReplyTo}
              className="btn btn-xs btn-circle btn-ghost"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      {videoPreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <video
              src={videoPreview}
              className="w-32 h-20 object-cover rounded-lg border border-zinc-700"
              muted
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
              <Video size={20} className="text-white" />
            </div>
            <button
              onClick={removeVideo}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
          <div className="text-sm text-zinc-400">
            <p>Video ready to send</p>
          </div>
        </div>
      )}

      {isUploading && (
        <div className="mb-3 flex items-center gap-2 text-sm text-zinc-400">
          <span className="loading loading-spinner loading-sm"></span>
          <span>
            {videoPreview
              ? "Uploading video..."
              : imagePreview
                ? "Uploading image..."
                : "Sending..."}
          </span>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isUploading}
          />

          {/* Hidden file inputs */}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
          <input
            type="file"
            accept="video/*"
            className="hidden"
            ref={videoInputRef}
            onChange={handleVideoChange}
          />

          {/* Attachment dropdown */}
          <div className="dropdown dropdown-top dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-circle btn-ghost"
            >
              <Paperclip size={20} className="text-zinc-400" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-100 rounded-box z-[1] w-36 sm:w-40 p-2 shadow mb-2 border border-base-300"
            >
              <li>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 text-sm"
                >
                  <Image size={16} />
                  Photo
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="flex items-center gap-2 text-sm"
                >
                  <Video size={16} />
                  Video
                </button>
              </li>
            </ul>
          </div>

          {/* Send button */}
          <button
            type="submit"
            className={`btn btn-sm ${
              !text.trim() && !imagePreview && !videoPreview ? "" : "bg-primary"
            } btn-circle`}
            disabled={
              (!text.trim() && !imagePreview && !videoPreview) || isUploading
            }
          >
            {isUploading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default MessageInput;
