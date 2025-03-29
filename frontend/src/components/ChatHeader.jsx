import { X, Trash2, Trash2Icon } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, clearChat } = useChatStore();
  const { onlineUsers } = useAuthStore();

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear this chat?")) {
      clearChat();
    }
  };

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
            </div>
          </div>
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleClearChat} className="btn btn-sm btn-error">
            <Trash2 size={16} />
            <span className="hidden sm:inline">Clear Chat</span>
          </button>
          <button onClick={() => setSelectedUser(null)} className="btn btn-sm">
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;