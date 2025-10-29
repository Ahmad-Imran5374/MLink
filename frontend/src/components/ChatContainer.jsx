import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import ImagePreview from "./ImagePreview";
import MessageStatus from "./MessageStatus";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils.js";

function ChatContainer() {
  const {
    messages,
    getMessages,
    isMessageLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    markMessagesAsSeen,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const [previewImage, setPreviewImage] = useState(null);
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
  }, [messages]);

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
              ref={messageEndRef}
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

              <div
                className={`${
                  message.senderId === authUser._id
                    ? "bg-primary text-primary-content"
                    : "text-base-content/80 bg-base-200"
                } rounded-2xl flex flex-col relative max-w-xs sm:max-w-md shadow-sm `}
                style={{
                  paddingLeft: "10px",
                  paddingRight: "10px",
                  paddingTop: "8px",
                  paddingBottom: "8px",
                }}
              >
                {message.image && (
                  <div className={`${message.text ? "mb-1" : ""} -mx-1`}>
                    <img
                      src={message.image}
                      alt="attachment"
                      className="sm:max-w-[200px] rounded-lg cursor-pointer hover:opacity-80 transition-opacity w-full"
                      onClick={() => setPreviewImage(message.image)}
                    />
                  </div>
                )}
                {message.text && (
                  <div className={`${message.image ? "mt-1" : ""}`}>
                    <p className="break-words leading-relaxed">
                      {message.text}
                    </p>
                  </div>
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
          ))}
        </div>
        <MessageInput />
      </div>

      <ImagePreview
        imageUrl={previewImage}
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </>
  );
}

export default ChatContainer;
