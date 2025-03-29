import { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    toggleMessageSelection,
    showContextMenu,
    selectedMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
      subscribeToMessages();
    }
    return () => unsubscribeFromMessages();
  }, [selectedUser?._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleDoubleClick = (message, event) => {
    event.stopPropagation();
    toggleMessageSelection(message);
    console.log("Selected messages:", selectedMessages);
  };

  const handleRightClick = (e, message) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedMessages.some((msg) => msg._id === message._id)) {
      toggleMessageSelection(message);
    }
    showContextMenu(e.clientX, e.clientY, message);
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${
              (message.senderId._id || message.senderId) === authUser._id
                ? "chat-end"
                : "chat-start"
            } ${
              selectedMessages.some((msg) => msg._id === message._id)
                ? "selected-message"
                : ""
            }`}
            onDoubleClick={(e) => handleDoubleClick(message, e)}
            onContextMenu={(e) => handleRightClick(e, message)}
            ref={messageEndRef}
          >
            <div
              className="chat-image avatar"
              onDoubleClick={(e) => e.stopPropagation()}
            >
              <div className="size-10 rounded-full border">
              <img
                src={
                  (message.senderId._id || message.senderId) === authUser._id
                    ? authUser.profilePic || "/avatar.png"
                    : selectedUser.profilePic || "/avatar.png"
                }
                alt="profile pic"
              />
              </div>
            </div>
            <div
              className="chat-header mb-1"
              onDoubleClick={(e) => e.stopPropagation()}
            >
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div
              className="chat-bubble flex flex-col"
              onDoubleClick={(e) => e.stopPropagation()}
            >
              {message.image && (
                <img
                  src={`http://localhost:5001${message.image}`} // Add full URL
                  alt="Message attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                  onError={(e) => console.log("Image load error:", message.image)} // Debug log
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatContainer;