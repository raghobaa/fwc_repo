// backend/src/index.js
import dotenv from "dotenv";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import jwt from "jsonwebtoken";
import connectDB from "./config/db.js";
import app from "./app.js";
import Interview from "./models/Interview.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Socket.IO for interview signaling
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const nsp = io.of("/interview");

nsp.use(async (socket, next) => {
  try {
    const { token, roomId } = socket.handshake.auth || {};
    if (!token || !roomId) return next(new Error("unauthorized"));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded?.id;
    if (!userId) return next(new Error("unauthorized"));
    const iv = await Interview.findOne({ roomId }).lean();
    if (!iv) return next(new Error("room_not_found"));
    const isParticipant = iv.candidateId?.toString() === userId || (iv.interviewerIds || []).some((id) => id.toString() === userId);
    // HR can also join any interview
    // Note: we don't fetch user here; treat non-participants as forbidden
    if (!isParticipant) return next(new Error("forbidden"));
    socket.data.userId = userId;
    socket.data.roomId = roomId;
    return next();
  } catch (e) {
    return next(new Error("unauthorized"));
  }
});

nsp.on("connection", (socket) => {
  const { roomId, userId } = socket.data;
  socket.join(roomId);
  // Notify others only; avoid sending to self to prevent both peers offering
  socket.to(roomId).emit("participant:joined", { userId });

  socket.on("signal:offer", ({ to, description }) => {
    socket.to(roomId).emit("signal:offer", { from: userId, description });
  });
  socket.on("signal:answer", ({ to, description }) => {
    socket.to(roomId).emit("signal:answer", { from: userId, description });
  });
  socket.on("signal:candidate", ({ candidate }) => {
    socket.to(roomId).emit("signal:candidate", { from: userId, candidate });
  });
  socket.on("chat:message", ({ text }) => {
    nsp.to(roomId).emit("chat:message", { from: userId, text, ts: Date.now() });
  });
  socket.on("meeting:end", async () => {
    nsp.to(roomId).emit("meeting:ended");
  });

  socket.on("disconnect", () => {
    nsp.to(roomId).emit("participant:left", { userId });
  });
});

connectDB().then(() => {
  server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
});
