import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { copyToClipboard } from "../lib/utils";

const MessageContextMenu = () => {
  const {
    contextMenu,
    hideContextMenu,
    deleteMessage,
    setForwardingMessages,
    selectedMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();

  if (!contextMenu.visible) return null;

  const isSender = selectedMessages.every((msg) => msg.senderId._id === authUser._id);
  const canCopy = selectedMessages.length === 1 && selectedMessages[0].text;

  const handleCopy = () => {
    if (canCopy) {
      copyToClipboard(selectedMessages[0].text);
    }
    hideContextMenu();
  };

  const handleForward = () => {
    setForwardingMessages(selectedMessages);
    hideContextMenu();
  };

  const handleDelete = () => {
    if (isSender) {
      deleteMessage();
    }
    hideContextMenu();
  };

  return (
    <div
      className="context-menu"
      style={{ top: contextMenu.y, left: contextMenu.x }}
      onClick={hideContextMenu}
    >
      <button onClick={handleForward}>Forward</button>
      {canCopy && <button onClick={handleCopy}>Copy</button>}
      {isSender && <button onClick={handleDelete}>Delete</button>}
    </div>
  );
};

export default MessageContextMenu;