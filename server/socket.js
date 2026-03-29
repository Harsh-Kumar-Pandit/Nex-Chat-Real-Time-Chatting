import { Server as SocketIoServer } from "socket.io";
import Message from "./models/MessageModal.js";
import Channel from "./models/ChannelModel.js";

const setupSocket = (server, app) => {
  const allowedOrigins = (process.env.ORIGIN || "http://localhost:5173,http://localhost:5174")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const isAllowedOrigin = (requestOrigin) => {
    if (!requestOrigin) return true;
    if (allowedOrigins.includes(requestOrigin)) return true;
    return /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(requestOrigin);
  };

  const io = new SocketIoServer(server, {
    cors: {
      origin: (requestOrigin, callback) => {
        if (isAllowedOrigin(requestOrigin)) {
          callback(null, true);
          return;
        }

        callback(new Error(`CORS blocked for origin: ${requestOrigin}`));
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const userSocketMap = new Map();

  // ✅ Attach io and userSocketMap to app so controllers can access them
  app.set("io", io);
  app.set("userSocketMap", userSocketMap);

  const handleDisconnect = (socket) => {
    console.log(`Client Disconnected: ${socket.id}`);
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
  };

  const sendMessage = async (message) => {
    const senderSocketId = userSocketMap.get(message.sender);
    const recipientSocketId = userSocketMap.get(message.recipient);
    const createdMessage = await Message.create(message);
    const messageData = await Message.findById(createdMessage._id)
      .populate("sender", "id email firstName lastName image color")
      .populate("recipient", "id email firstName lastName image color");
    if (recipientSocketId)
      io.to(recipientSocketId).emit("receiveMessage", messageData);
    if (senderSocketId)
      io.to(senderSocketId).emit("receiveMessage", messageData);
  };

  const sendChannelMessage = async (data) => {
    const { channelId, sender, content, messageType, fileUrl } = data;
    const createdMessage = await Message.create({
      sender,
      recipient: null,
      content,
      messageType,
      fileUrl,
      timestamp: new Date(),
    });
    const messageData = await Message.findById(createdMessage._id)
      .populate("sender", "id email firstName lastName image color");
    await Channel.findByIdAndUpdate(channelId, {
      $push: { messages: createdMessage._id },
    });
    const channel = await Channel.findById(channelId).populate("members");
    const finalData = { ...messageData._doc, channelId: channel._id };

    const alreadyNotified = new Set();
    channel.members.forEach((member) => {
      const memberSocketId = userSocketMap.get(member._id.toString());
      if (memberSocketId) {
        alreadyNotified.add(member._id.toString());
        io.to(memberSocketId).emit("receiveChannelMessage", finalData);
      }
    });

    const adminId = channel.admin.toString();
    if (!alreadyNotified.has(adminId)) {
      const adminSocketId = userSocketMap.get(adminId);
      if (adminSocketId) {
        io.to(adminSocketId).emit("receiveChannelMessage", finalData);
      }
    }
  };

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      userSocketMap.set(userId, socket.id);
      console.log(`User connected: ${userId} | Socket: ${socket.id}`);
    } else {
      console.log("User ID not provided during connection.");
    }
    socket.on("sendMessage", sendMessage);
    socket.on("sendChannelMessage", sendChannelMessage);
    socket.on("disconnect", () => handleDisconnect(socket));
  });

  return io;
};

export default setupSocket;
