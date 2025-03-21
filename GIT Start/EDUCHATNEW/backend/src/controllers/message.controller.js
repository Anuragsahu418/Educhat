// backend/src/controllers/message.controller.js
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import mongoose from "mongoose";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error.message, error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;
    const messages = await Message.find({
      $or: [{ senderId: myId, receiverId: userToChatId }, { senderId: userToChatId, receiverId: myId }],
    }).lean(); // Use lean() for better performance
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages:", error.message, error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id; // Use ObjectId directly
    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }
    const newMessage = new Message({ senderId, receiverId, text, image: imageUrl });
    await newMessage.save();
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) io.to(receiverSocketId).emit("newMessage", newMessage);
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage:", error.message, error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMessages = async (req, res) => {
  try {
    console.log("Delete request received:", {
      params: req.params,
      body: req.body,
      cookies: req.cookies,
      user: req.user,
    });

    let messageIds = [];

    if (req.params.id) {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        console.log("Invalid message ID format:", req.params.id);
        return res.status(400).json({ error: "Invalid message ID format" });
      }
      messageIds = [req.params.id];
      console.log("Single message deletion for ID:", req.params.id);
    } else if (req.body.messageIds) {
      if (!Array.isArray(req.body.messageIds) || req.body.messageIds.length === 0) {
        console.log("Invalid messageIds in body:", req.body.messageIds);
        return res.status(400).json({ error: "Message IDs must be a non-empty array" });
      }
      const invalidIds = req.body.messageIds.filter((id) => !mongoose.Types.ObjectId.isValid(id));
      if (invalidIds.length > 0) {
        console.log("Invalid message IDs in bulk request:", invalidIds);
        return res.status(400).json({ error: "One or more invalid message IDs" });
      }
      messageIds = req.body.messageIds;
      console.log("Bulk message deletion for IDs:", messageIds);
    } else {
      return res.status(400).json({ error: "Message IDs are required" });
    }

    const senderId = req.user._id;
    console.log("Sender ID:", senderId.toString(), "Message IDs:", messageIds);

    const messages = await Message.find({ _id: { $in: messageIds } });
    console.log("Found messages:", messages.map((m) => ({
      id: m._id,
      senderId: m.senderId.toString(),
      receiverId: m.receiverId.toString(),
      text: m.text,
    })));

    if (messages.length !== messageIds.length) {
      const foundIds = messages.map((m) => m._id.toString());
      const missingIds = messageIds.filter((id) => !foundIds.includes(id));
      console.log("Messages not found for IDs:", missingIds);
      return res.status(404).json({ error: "One or more messages not found", missingIds });
    }

    const unauthorizedMessages = messages.filter((msg) => !msg.senderId.equals(senderId));
    if (unauthorizedMessages.length > 0) {
      console.log("Unauthorized messages:", unauthorizedMessages.map((m) => ({
        id: m._id,
        senderId: m.senderId.toString(),
      })));
      return res.status(403).json({ error: "Unauthorized to delete one or more messages" });
    }

    console.log("Deleting messages with IDs:", messageIds);
    const result = await Message.deleteMany({ _id: { $in: messageIds } });
    console.log("Delete result:", result);

    io.emit("deleteMessage", messageIds);
    res.status(200).json({ message: "Messages deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error.message, error.stack);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};