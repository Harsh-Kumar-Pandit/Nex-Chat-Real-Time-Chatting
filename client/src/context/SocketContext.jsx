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

    setSocket(newSocket);

    const handleReceiveMessage = (message) => {
  const { selectedChatData, selectedChatType, addMessage } =
    useAppStore.getState();

  if (
    selectedChatType !== undefined &&
    (selectedChatData._id === message.sender._id ||
      selectedChatData._id === message.recipient._id)
  ) {
    console.log("message rcv", message);
    
    addMessage(message);
  }
};

    newSocket.on("receiveMessage", handleReceiveMessage)

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