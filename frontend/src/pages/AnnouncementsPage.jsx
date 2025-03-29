import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import AnnouncementInput from "../components/AnnouncementInput";

const AnnouncementsPage = () => {
  const { authUser } = useAuthStore();
  const [announcements, setAnnouncements] = useState([]);
  const fileInputRef = useRef(null);

  const fetchAnnouncements = async () => {
    try {
      const res = await axiosInstance.get("/announcements");
      setAnnouncements(res.data);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast.error("Failed to load announcements");
    }
  };

  useEffect(() => {
    if (authUser) {
      fetchAnnouncements();
    }
  }, [authUser]);

  const handleSendAnnouncement = async (data) => {
    try {
      await axiosInstance.post("/announcements/create", data);
      toast.success("Announcement sent successfully!");
      fetchAnnouncements();
    } catch (error) {
      console.error("Error sending announcement:", error);
      toast.error("Failed to send announcement");
    }
  };

  const isTeacher = authUser?.role === "teacher";

  if (!authUser) {
    return <div className="text-center p-5">Please log in to view announcements.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-5">
      <h1 className="text-2xl font-bold mb-4">Announcements</h1>

      {isTeacher && (
        <div className="mb-6">
          <AnnouncementInput onSend={handleSendAnnouncement} />
        </div>
      )}

      <div className="space-y-4">
        {announcements.length === 0 ? (
          <p className="text-center text-gray-500">No announcements yet.</p>
        ) : (
          announcements.map((announcement) => (
            <div key={announcement._id} className="p-4 bg-gray-100 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <img
                  src={announcement.senderId.profilePic || "/avatar.png"}
                  alt="profile pic"
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <p className="font-semibold">{announcement.senderId.fullName}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(announcement.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <p>{announcement.text}</p>
              {announcement.files && announcement.files.length > 0 && (
                <div className="mt-2">
                  {announcement.files.map((file, index) => (
                    <a key={index} href={file} target="_blank" rel="noopener noreferrer" className="block text-blue-500">
                      File {index + 1}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AnnouncementsPage;