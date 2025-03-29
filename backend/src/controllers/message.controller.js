import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { io, getReceiverSocketId } from "../lib/socket.js";

// Get users for the sidebar (excluding the authenticated user)
export const getUsersForSidebar = async (req, res) => {
  try {
    const authUserId = req.user._id;
    const users = await User.find({ _id: { $ne: authUserId } }).select(
      "_id fullName profilePic"
    );
    res.status(200).json(users);
  } catch (error) {
    console.log("Error in getUsersForSidebar controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get messages between the authenticated user and the selected user
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: senderId },
      ],
    })
      .populate("senderId", "_id fullName profilePic")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Send a message (with or without an image)
export const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let image = "";
    if (req.file) {
      image = `/uploads/${req.file.filename}`; // Path to the uploaded image
      console.log("Image uploaded:", image);
    } else {
      console.log("No image uploaded");
    }

    const message = new Message({
      senderId,
      receiverId,
      text: text || "",
      image,
    });

    await message.save();

    // Populate senderId to include the full user object
    await message.populate("senderId", "_id fullName profilePic");

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", message);
    }

    res.status(200).json(message);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete selected messages
export const deleteMessage = async (req, res) => {
  try {
    const { ids } = req.body;
    const authUserId = req.user._id;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Message IDs are required" });
    }

    // Find messages to delete
    const messages = await Message.find({ _id: { $in: ids } });

    // Check if the authenticated user is authorized to delete each message
    const unauthorizedMessages = messages.filter(
      (message) => message.senderId.toString() !== authUserId.toString()
    );

    if (unauthorizedMessages.length > 0) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete some messages" });
    }

    // Delete the messages
    await Message.deleteMany({ _id: { $in: ids } });

    // Emit event to notify other users
    const receiverIds = [
      ...new Set(messages.map((msg) => msg.receiverId.toString())),
    ];
    receiverIds.forEach((receiverId) => {
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("messagesDeleted", ids);
      }
    });

    res.status(200).json({ message: "Messages deleted successfully" });
  } catch (error) {
    console.log("Error in deleteMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Clear chat between the authenticated user and the selected user
export const clearChat = async (req, res) => {
  try {
    const { id: chatPartnerId } = req.params;
    const authUserId = req.user._id;

    // Delete messages between the two users
    await Message.deleteMany({
      $or: [
        { senderId: authUserId, receiverId: chatPartnerId },
        { senderId: chatPartnerId, receiverId: authUserId },
      ],
    });

    // Emit event to notify the chat partner
    const receiverSocketId = getReceiverSocketId(chatPartnerId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("chatCleared", {
        userId: authUserId,
        chatPartnerId,
      });
    }

    res.status(200).json({ message: "Chat cleared successfully" });
  } catch (error) {
    console.log("Error in clearChat controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};