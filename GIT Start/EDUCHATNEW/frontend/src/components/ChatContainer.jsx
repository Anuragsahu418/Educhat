// frontend/src/components/ChatContainer.jsx
import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { useThemeStore } from "../store/useThemeStore";
import { Reply, Copy, Share2, Trash2 } from "lucide-react";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    toggleMessageSelection,
    deleteSingleMessage,
    selectedMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const { theme } = useThemeStore();
  const messageEndRef = useRef(null);
  const [contextMenu, setContextMenu] = useState(null);

  useEffect(() => {
    console.log("Selected User:", selectedUser);
    if (selectedUser && selectedUser._id) {
      getMessages(selectedUser._id).catch((error) =>
        console.error("Error fetching messages:", error)
      );
      subscribeToMessages();
    }
    return () => unsubscribeFromMessages();
  }, [selectedUser?._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    console.log("Messages updated:", messages);
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    console.log("Loading messages...");
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader selectedMessages={selectedMessages} />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  if (!selectedUser || !selectedUser._id) {
    console.log("No selected user or invalid user ID");
    return (
      <div className="flex-1 flex items-center justify-center text-center p-4">
        <p>Select a user to start chatting</p>
      </div>
    );
  }

  const handleDoubleClick = (messageId) => {
    toggleMessageSelection(messageId);
    setContextMenu(null);
  };

  const handleRightClick = (e, messageId) => {
    e.preventDefault();
    const message = messages.find((msg) => msg._id === messageId);
    if (!message) {
      console.log("Message not found for ID:", messageId);
      return;
    }
    console.log("Right-clicked message:", {
      messageId,
      senderId: message.senderId,
      receiverId: message.receiverId,
      text: message.text,
      loggedInUserId: authUser._id,
    });
    if (message.senderId !== authUser._id) {
      console.log("Cannot show context menu: Not the sender of this message");
      return;
    }

    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      messageId,
    });
  };

  const handleReply = () => {
    if (contextMenu?.messageId) {
      console.log("Replying to message ID:", contextMenu.messageId);
      // Implement reply logic here (e.g., focus input and prepend "Re: ")
      const input = document.querySelector("textarea");
      if (input) {
        input.focus();
        input.value = `Re: ${messages.find((msg) => msg._id === contextMenu.messageId)?.text || ""}\n`;
      }
    }
    setContextMenu(null);
  };

  const handleCopy = () => {
    if (contextMenu?.messageId) {
      const messageText = messages.find((msg) => msg._id === contextMenu.messageId)?.text || "";
      navigator.clipboard.writeText(messageText).then(() => {
        console.log("Copied message to clipboard:", messageText);
      });
    }
    setContextMenu(null);
  };

  const handleForward = () => {
    if (contextMenu?.messageId) {
      toggleMessageSelection(contextMenu.messageId);
      const { forwardSelectedMessages } = useChatStore.getState();
      forwardSelectedMessages();
    }
    setContextMenu(null);
  };

  const handleDelete = () => {
    if (contextMenu?.messageId) {
      console.log("Initiating deletion for message ID:", contextMenu.messageId);
      deleteSingleMessage(contextMenu.messageId);
    }
    setContextMenu(null);
  };

  const isSelected = (messageId) => selectedMessages.includes(messageId);
  const selectedBgClass = theme === "dark" ? "bg-base-300" : "bg-base-200";

  return (
    <div className="flex-1 flex flex-col overflow-auto bg-gray-900 text-white">
      <ChatHeader selectedMessages={selectedMessages} />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">No messages yet</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"} ${
                isSelected(message._id) ? selectedBgClass : ""
              } relative`}
              onDoubleClick={() => handleDoubleClick(message._id)}
              onContextMenu={(e) => handleRightClick(e, message._id)}
            >
              <div className="chat-image avatar">
                <div className="w-10 rounded-full border">
                  <img
                    src={
                      message.senderId === authUser._id
                        ? authUser.profilePic || "/avatar.png"
                        : selectedUser.profilePic || "/avatar.png"
                    }
                    alt="profile pic"
                    className="w-full h-full rounded-full"
                  />
                </div>
              </div>
              <div className="chat-header text-xs text-gray-400 mb-1">
                <time>{formatMessageTime(message.createdAt)}</time>
              </div>
              <div className="chat-bubble bg-gray-800 text-white p-2 rounded-lg">
                {message.image && (
                  <img src={message.image} alt="Attachment" className="max-w-[200px] rounded-md mb-2" />
                )}
                {message.text && <p>{message.text}</p>}
              </div>
              {isSelected(message._id) && (
                <div className="absolute top-2 right-2">
                  <input type="checkbox" checked={true} readOnly className="checkbox checkbox-sm" />
                </div>
              )}
            </div>
          ))
        )}
        {contextMenu && (
          <div
            className="fixed bg-gray-800 text-white shadow-lg rounded-md p-2 border border-gray-700 z-50"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.preventDefault()}
          >
            <button onClick={handleReply} className="flex items-center text-sm mb-1 w-full hover:bg-gray-700 p-1 rounded">
              <Reply size={16} className="mr-2" /> Reply
            </button>
            <button onClick={handleCopy} className="flex items-center text-sm mb-1 w-full hover:bg-gray-700 p-1 rounded">
              <Copy size={16} className="mr-2" /> Copy
            </button>
            <button onClick={handleForward} className="flex items-center text-sm mb-1 w-full hover:bg-gray-700 p-1 rounded">
              <Share2 size={16} className="mr-2" /> Forward
            </button>
            <button onClick={handleDelete} className="flex items-center text-sm w-full hover:bg-gray-700 p-1 rounded">
              <Trash2 size={16} className="mr-2" /> Delete for me
            </button>
          </div>
        )}
        <div ref={messageEndRef} />
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatContainer;