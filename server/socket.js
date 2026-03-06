import { Server as SocketIoServer } from "socket.io";
import Message from "./models/MessageModal.js";

const setupSocket = (server) => {
  const io = new SocketIoServer(server, {
    cors: {
      origin: process.env.ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const userSocketMap = new Map();

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

    const createdMessage = await Message.create(message)

    const messageData = await Message.findById(createdMessage._id).populate("sender", "id email firstName lastName image color").populate("recipient", "id email firstName lastName image color")

        // Send to recipient
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("receiveMessage", messageData);
    }

    // Send back to sender (so sender also sees it instantly)
    if (senderSocketId) {
      io.to(senderSocketId).emit("receiveMessage", messageData);
    }

  }

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      userSocketMap.set(userId, socket.id);
      console.log(`User connected: ${userId} | Socket: ${socket.id}`);
    } else {
      console.log("User ID not provided during connection.");
    }

socket.on("sendMessage", sendMessage);
    socket.on("disconnect", () => handleDisconnect(socket));
  });

  return io;
};

export default setupSocket;