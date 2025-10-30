import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import ImagePreview from "./ImagePreview";
import VideoPreview from "./VideoPreview";
import MessageStatus from "./MessageStatus";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils.js";
import {
  Trash2,
  Reply,
  ChevronDown,
  Image as ImageIcon,
  Video as VideoIcon,
} from "lucide-react";

function ChatContainer() {
  const {
    messages,
    getMessages,
    isMessageLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    markMessagesAsSeen,
    deleteMessage,
    setReplyTo,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const [previewImage, setPreviewImage] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [highlightedMessage, setHighlightedMessage] = useState(null);
  const messageRefs = useRef({});
  useEffect(() => {
    getMessages(selectedUser._id);
    markMessagesAsSeen(selectedUser._id);

    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [
    selectedUser._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
    markMessagesAsSeen,
  ]);

  useEffect(() => {
    if (messageEndRef && messages) {
      messageEndRef.current?.scrollIntoView({ behaviour: "smooth" });
    }

    // Mark messages as seen when new messages arrive and user is viewing the chat
    if (messages.length > 0 && selectedUser && !document.hidden) {
      markMessagesAsSeen(selectedUser._id);
    }
  }, [messages, selectedUser, markMessagesAsSeen]);

  // Mark messages as seen when user is viewing the chat
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && selectedUser) {
        markMessagesAsSeen(selectedUser._id);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [selectedUser, markMessagesAsSeen]);

  const messageEndRef = useRef();

  // Helper function to get media duration
  const getMediaDuration = (url, type) => {
    return new Promise((resolve) => {
      const element =
        type === "video"
          ? document.createElement("video")
          : document.createElement("audio");
      element.src = url;
      element.onloadedmetadata = () => {
        const duration = Math.floor(element.duration);
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        resolve(`${minutes}:${seconds.toString().padStart(2, "0")}`);
      };
      element.onerror = () => resolve("0:00");
    });
  };

  // Handle clicking on reply preview to scroll and highlight original message
  const handleReplyClick = (replyToId) => {
    const messageElement = messageRefs.current[replyToId];
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedMessage(replyToId);
      setTimeout(() => setHighlightedMessage(null), 2000);
    }
  };

  if (isMessageLoading)
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );

  return (
    <>
      <div className="flex-1 flex flex-col justify-between overflow-auto">
        <ChatHeader />
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((message) => (
            <div
              key={message._id}
              className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
              ref={(el) => {
                messageRefs.current[message._id] = el;
                if (message._id === messages[messages.length - 1]._id) {
                  messageEndRef.current = el;
                }
              }}
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full ">
                  <img
                    src={
                      message.senderId === authUser._id
                        ? authUser.profilePic || "/avatar.png"
                        : selectedUser.profilePic || "/avatar.png"
                    }
                    alt="Profile pic"
                  />
                </div>
              </div>

              <div className="relative group">
                {/* Message menu - only show for non-deleted messages */}
                {!message.isDeleted && (
                  <div
                    className={`absolute -top-0  ${message.senderId === authUser._id ? "right-2" : "left-2"} opacity-0 group-hover:opacity-100 bg-transparent transition-all duration-300 z-10`}
                  >
                    <div className="dropdown dropdown-end">
                      <div
                        tabIndex={0}
                        role="button"
                        className="flex items-center justify-center w-7 h-7 bg-base-100/95 hover:bg-base-100 border border-base-300/50 shadow-lg backdrop-blur-md rounded-full transition-all duration-200 hover:scale-110"
                      >
                        <ChevronDown
                          size={14}
                          className="text-base-content/80 hover:text-base-content transition-colors"
                        />
                      </div>
                      <ul
                        tabIndex={0}
                        className="dropdown-content menu bg-base-100/95 backdrop-blur-md rounded-2xl w-44 p-2 shadow-2xl border border-base-300/50 mt-2"
                      >
                        <li>
                          <button
                            onClick={() => setReplyTo(message)}
                            className="text-sm py-3 px-4 hover:bg-base-200/70 rounded-xl flex items-center gap-3 transition-all duration-200"
                          >
                            <Reply size={16} className="text-primary" />
                            <span className="font-medium">Reply</span>
                          </button>
                        </li>
                        {message.senderId === authUser._id && (
                          <li>
                            <button
                              onClick={() => {
                                if (window.confirm("Delete this message?")) {
                                  deleteMessage(message._id);
                                }
                              }}
                              className="text-sm py-3 px-4 hover:bg-error/10 text-error rounded-xl flex items-center gap-3 transition-all duration-200"
                            >
                              <Trash2 size={16} />
                              <span className="font-medium">Delete</span>
                            </button>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                )}

                <div
                  className={`${
                    message.senderId === authUser._id
                      ? "bg-primary text-primary-content"
                      : "text-base-content/80 bg-base-200"
                  } ${
                    highlightedMessage === message._id
                      ? "ring-4 ring-accent ring-opacity-50"
                      : ""
                  } rounded-2xl flex flex-col relative max-w-xs sm:max-w-md shadow-sm transition-all duration-300`}
                  style={{
                    paddingLeft: "10px",
                    paddingRight: "10px",
                    paddingTop: "8px",
                    paddingBottom: "8px",
                  }}
                >
                  {/* Reply preview */}
                  {message.replyTo && (
                    <div
                      onClick={() =>
                        !message.replyTo.isDeleted &&
                        handleReplyClick(message.replyTo._id)
                      }
                      className={`mb-2 p-2 rounded-lg border-l-3 ${
                        message.senderId === authUser._id
                          ? "bg-primary-content/20 border-primary-content"
                          : "bg-base-300/50 border-base-content/30"
                      } ${!message.replyTo.isDeleted ? "cursor-pointer hover:bg-opacity-30 transition-all" : ""}`}
                    >
                      <div className="text-xs font-semibold mb-1 opacity-90">
                        {message.replyTo.senderId === authUser._id
                          ? "You"
                          : selectedUser.fullName}
                      </div>
                      {message.replyTo.isDeleted ? (
                        <div className="text-xs italic opacity-70 flex items-center gap-1">
                          <Trash2 size={12} />
                          <span>This message was deleted</span>
                        </div>
                      ) : (
                        <div className="text-xs opacity-90 line-clamp-2 break-words flex items-start gap-1.5">
                          {message.replyTo.image && (
                            <div className="flex items-center gap-1 font-medium">
                              <ImageIcon size={14} />
                              <span>Photo</span>
                            </div>
                          )}
                          {message.replyTo.video && (
                            <div className="flex items-center gap-1 font-medium">
                              <VideoIcon size={14} />
                              <span>Video</span>
                            </div>
                          )}
                          {message.replyTo.text && (
                            <span>{message.replyTo.text}</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Deleted message */}
                  {message.isDeleted ? (
                    <div className="flex items-center gap-2 italic opacity-60">
                      <Trash2 size={14} />
                      <span>This message was deleted</span>
                    </div>
                  ) : (
                    <>
                      {message.image && (
                        <div
                          className={`${message.text || message.video ? "mb-1" : ""} -mx-1`}
                        >
                          <img
                            src={message.image}
                            alt="attachment"
                            className="sm:max-w-[200px] rounded-lg cursor-pointer hover:opacity-80 transition-opacity w-full"
                            onClick={() => setPreviewImage(message.image)}
                          />
                        </div>
                      )}
                      {message.video && (
                        <div
                          className={`${message.text || message.image ? "mb-1" : ""} -mx-1`}
                        >
                          <video
                            src={message.video}
                            className="sm:max-w-[250px] rounded-lg w-full cursor-pointer hover:opacity-80 transition-opacity"
                            controls
                            preload="metadata"
                            onClick={() => setPreviewVideo(message.video)}
                          />
                        </div>
                      )}
                      {message.text && (
                        <div
                          className={`${message.image || message.video ? "mt-1" : ""}`}
                        >
                          <p className="break-words leading-relaxed">
                            {message.text}
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {/* Message status and time */}
                  <div className="flex items-center justify-end gap-1 mt-1 text-xs opacity-60">
                    <span className="text-[11px]">
                      {formatMessageTime(message.createdAt)}
                    </span>
                    <MessageStatus
                      message={message}
                      isOwnMessage={message.senderId === authUser._id}
                      textColor={
                        message.senderId === authUser._id
                          ? "text-primary-content"
                          : "text-base-content"
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <MessageInput />
      </div>

      <ImagePreview
        imageUrl={previewImage}
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
      />

      <VideoPreview
        videoUrl={previewVideo}
        isOpen={!!previewVideo}
        onClose={() => setPreviewVideo(null)}
      />
    </>
  );
}

export default ChatContainer;
