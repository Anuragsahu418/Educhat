import io from "../index.js";

const userSocketMap = new Map();

export const getReceiverSocketId = (userId) => {
  return userSocketMap.get(userId.toString());
};

export const setupSocketEvents = () => {
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("setUser", (userId) => {
      console.log("User set:", userId, "with socket ID:", socket.id);
      userSocketMap.set(userId.toString(), socket.id);
      io.emit("onlineUsers", {
        count: userSocketMap.size,
        userIds: Array.from(userSocketMap.keys()),
      });
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
      const userId = Array.from(userSocketMap.entries()).find(([_, sid]) => sid === socket.id)?.[0];
      if (userId) {
        userSocketMap.delete(userId);
        io.emit("onlineUsers", {
          count: userSocketMap.size,
          userIds: Array.from(userSocketMap.keys()),
        });
      }
    });

    socket.on("deleteMessage", (messageIds) => {
      console.log("Broadcasting deleteMessage:", messageIds);
      io.emit("deleteMessage", messageIds);
    });

    socket.on("clearChat", ({ senderId, receiverId }) => {
      console.log("Broadcasting clearChat:", { senderId, receiverId });
      const receiverSocketId = getReceiverSocketId(receiverId);
      const senderSocketId = getReceiverSocketId(senderId);
      if (receiverSocketId) io.to(receiverSocketId).emit("clearChat", { senderId, receiverId });
      if (senderSocketId && senderSocketId !== receiverSocketId) {
        io.to(senderSocketId).emit("clearChat", { senderId, receiverId });
      }
    });
  });
};

export { io, userSocketMap };