// backend/src/index.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

const onlineUsers = new Map(); // Map to store userId -> socketId

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // When a user connects, they send their userId
  socket.on("setUser", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log("User set:", userId, "Online users:", [...onlineUsers.keys()]);
    io.emit("onlineUsers", {
      count: onlineUsers.size,
      userIds: [...onlineUsers.keys()],
    });
  });

  socket.on("disconnect", () => {
    const userId = [...onlineUsers.entries()].find(([_, sid]) => sid === socket.id)?.[0];
    if (userId) {
      onlineUsers.delete(userId);
      console.log("Client disconnected, User ID:", userId, "Online users:", [...onlineUsers.keys()]);
      io.emit("onlineUsers", {
        count: onlineUsers.size,
        userIds: [...onlineUsers.keys()],
      });
    }
  });
});

const PORT = process.env.PORT || 5001;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
export default io;