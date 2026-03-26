import { Server as SocketIoServer } from "socket.io";
import Message from "./models/MessageModal.js";
import Channel from "./models/ChannelModel.js";

const setupSocket = (server, app) => {
  const io = new SocketIoServer(server, {
    cors: {
      origin: process.env.ORIGIN,
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

    // Video call signaling
    socket.on("call-user", (data) => {
      const { to, offer, from, callerInfo } = data;
      const recipientSocketId = userSocketMap.get(to);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("incoming-call", {
          from,
          offer,
          callerInfo,
        });
      } else {
        socket.emit("call-not-available", { to });
      }
    });

    socket.on("call-accepted", (data) => {
      const { to, answer } = data;
      const callerSocketId = userSocketMap.get(to);
      if (callerSocketId) {
        io.to(callerSocketId).emit("call-accepted", { answer });
      }
    });

    socket.on("call-rejected", (data) => {
      const { to } = data;
      const callerSocketId = userSocketMap.get(to);
      if (callerSocketId) {
        io.to(callerSocketId).emit("call-rejected");
      }
    });

    socket.on("call-ended", (data) => {
      const { to } = data;
      const otherSocketId = userSocketMap.get(to);
      if (otherSocketId) {
        io.to(otherSocketId).emit("call-ended");
      }
    });

    socket.on("ice-candidate", (data) => {
      const { to, candidate } = data;
      const recipientSocketId = userSocketMap.get(to);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("ice-candidate", { candidate });
      }
    });

    socket.on("disconnect", () => handleDisconnect(socket));
  });

  return io;
};

export default setupSocket;
