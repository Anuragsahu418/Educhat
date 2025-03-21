// backend/src/routes/message.route.js
import express from "express";
import { getUsersForSidebar, getMessages, sendMessage, deleteMessages } from "../controllers/message.controller.js";
import protectRoute from "../middleware/auth.middleware.js"; // Incorrect: expects default export

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);
router.delete("/delete", protectRoute, deleteMessages);
router.delete("/delete/:id", protectRoute, deleteMessages);

export default router;