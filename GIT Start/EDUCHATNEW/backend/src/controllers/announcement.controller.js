import { Announcement } from "../models/announcement.model.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import { Readable } from "stream";

// 1. Create an Announcement
export const createAnnouncement = async (req, res) => {
  try {
    const { text } = req.body;
    const files = req.files?.files;

    const senderId = req.user._id;
    const user = await User.findById(senderId);

    if (user.role !== "teacher") {
      return res.status(403).json({ message: "Only teachers can create announcements" });
    }

    // 📸 Upload files to Cloudinary (if any)
    let fileUrls = [];
    if (files) {
      const uploadPromises = Array.isArray(files) ? files : [files];
      fileUrls = await Promise.all(
        uploadPromises.map(async (file) => {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "educhat/announcements",
            allowed_formats: ["jpg", "png", "pdf", "docx"],
          });
          return result.secure_url;
        })
      );
    }

    // 📢 Create the Announcement
    const announcement = await Announcement.create({
      senderId,
      text,
      files: fileUrls,
    });

    // Populate sender details (for frontend)
    const populatedAnnouncement = await Announcement.findById(announcement._id).populate(
      "senderId",
      "fullName profilePic"
    );

    res.status(201).json(populatedAnnouncement);
  } catch (error) {
    console.error("Error creating announcement:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// 📚 2. Get All Announcements
export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate("senderId", "fullName profilePic")
      .sort({ createdAt: -1 });

    res.json(announcements);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
