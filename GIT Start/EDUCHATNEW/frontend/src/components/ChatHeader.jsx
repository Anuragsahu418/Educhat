// frontend/src/components/ChatHeader.jsx
import { useChatStore } from "../store/useChatStore";
import { Trash2, Share2, ArrowLeft } from "lucide-react"; // Added ArrowLeft for back button

const ChatHeader = ({ selectedMessages }) => {
  const { selectedUser, deleteSelectedMessages, forwardSelectedMessages, clearSelection } = useChatStore();

  const isSelectionMode = selectedMessages.length > 0;

  return (
    <div className="navbar bg-base-100 border-b">
      {isSelectionMode ? (
        <div className="flex-1 flex items-center gap-2">
          <button onClick={clearSelection} className="btn btn-ghost btn-circle">
            <ArrowLeft size={20} />
          </button>
          <span>{selectedMessages.length} selected</span>
        </div>
      ) : (
        <div className="flex-1 flex items-center gap-2">
          {/* Back button or user info */}
          <div className="avatar">
            <div className="size-10 rounded-full">
              <img src={selectedUser?.profilePic || "/avatar.png"} alt="profile pic" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold">{selectedUser?.username || "Chat"}</span>
            <span className="text-xs opacity-50">Online</span> {/* Adjust based on your online status logic */}
          </div>
        </div>
      )}

      {isSelectionMode && (
        <div className="flex-none flex gap-2">
          <button
            onClick={deleteSelectedMessages}
            className="btn btn-sm btn-error text-white"
          >
            <Trash2 size={16} /> Delete
          </button>
          <button
            onClick={forwardSelectedMessages}
            className="btn btn-sm btn-primary"
          >
            <Share2 size={16} /> Forward
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;