// backend/src/models/message.model.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: { type: String, required: true }, // Ensure this matches the type of req.user._id
  receiverId: { type: String, required: true },
  text: { type: String },
  image: { type: String },
}, { timestamps: true });

export default mongoose.model("Message", messageSchema);