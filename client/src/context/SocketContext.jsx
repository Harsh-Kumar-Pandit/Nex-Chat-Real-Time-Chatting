import { io } from "socket.io-client";
import { useAppStore } from "@/store";
import { HOST } from "@/utils/constants";
import { createContext, useContext, useEffect, useState } from "react";

const SocketContext = createContext(null);
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { userInfo } = useAppStore();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!userInfo) return;

    const newSocket = io(HOST, {
      withCredentials: true,
      query: { userId: userInfo.id },
    });

    newSocket.on("connect", () => {
      console.log("Connected:", newSocket.id);
    });

    const handleReceiveMessage = (message) => {
      const {
        selectedChatData,
        selectedChatType,
        addMessage,
        directMessagesContacts,
        setDirectMessagesContacts,
      } = useAppStore.getState();

      if (
        selectedChatType === "contact" &&
        selectedChatData &&
        (selectedChatData._id === message.sender._id ||
          selectedChatData._id === message.recipient._id)
      ) {
        addMessage(message);
      }
      const otherUser =
        message.sender._id === userInfo.id ? message.recipient : message.sender;

      if (!otherUser) return;

      const exists = directMessagesContacts.find((c) => c._id === otherUser._id);

      const updatedContact = {
        ...otherUser,
        lastMessage: {
          content: message.content,
          messageType: message.messageType,
        },
      };

      if (exists) {
        // Move to top with updated last message
        const updated = directMessagesContacts.filter(
          (c) => c._id !== otherUser._id
        );
        setDirectMessagesContacts([updatedContact, ...updated]);
      } else {
        setDirectMessagesContacts([updatedContact, ...directMessagesContacts]);
      }
    };

    const handleReceiveChannelMessage = (message) => {
      const { selectedChatData, selectedChatType, addMessage } =
        useAppStore.getState();
      if (
        selectedChatType === "channel" &&
        selectedChatData &&
        selectedChatData._id === message.channelId.toString()
      ) {
        addMessage(message);
      }
    };

    // ✅ New channel created — add to sidebar instantly
    const handleNewChannel = (channel) => {
      const { addChannel } = useAppStore.getState();
      if (addChannel) addChannel(channel);
    };

    newSocket.on("receiveMessage", handleReceiveMessage);
    newSocket.on("receiveChannelMessage", handleReceiveChannelMessage);
    newSocket.on("newChannel", handleNewChannel);

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [userInfo]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
