import { Router } from "express";
import {
  createAnnouncement,
  getAnnouncements,
} from "../controllers/announcement.controller.js";
import { protectRoute, isTeacher } from "../middleware/auth.middleware.js";

const router = Router();

// Teacher Creates Announcement
router.post("/create", protectRoute, isTeacher, createAnnouncement);
// Get All Announcements
router.get("/", protectRoute, getAnnouncements);

export default router;
