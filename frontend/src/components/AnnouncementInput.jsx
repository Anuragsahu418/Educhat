import { useState, useRef } from "react";
import toast from "react-hot-toast";

const AnnouncementInput = ({ onSend }) => {
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  // 📸 Handle File Change
  const handleFileChange = (e) => {
    setFiles([...files, ...Array.from(e.target.files)]);
  };

  // 📤 Send Announcement
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && files.length === 0) {
      toast.error("Please enter a message or upload a file.");
      return;
    }

    const formData = new FormData();
    formData.append("text", text);
    files.forEach((file) => formData.append("files", file));

    onSend(formData);

    // Clear Fields
    setText("");
    setFiles([]);
    fileInputRef.current.value = "";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        className="textarea w-full"
        placeholder="Announce something..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <input
        type="file"
        multiple
        ref={fileInputRef}
        className="file-input hidden"
        onChange={handleFileChange}
      />
      <button type="button" className="btn" onClick={() => fileInputRef.current.click()}>
        Upload Files
      </button>
      <button type="submit" className="btn btn-primary">
        Send
      </button>
    </form>
  );
};

export default AnnouncementInput;
