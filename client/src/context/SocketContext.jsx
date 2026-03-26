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

      const myId = userInfo.id?.toString();
      const senderId = message.sender?._id?.toString() ?? message.sender?.toString();
      const recipientId = message.recipient?._id?.toString() ?? message.recipient?.toString();

      if (
        selectedChatType === "contact" &&
        selectedChatData &&
        (selectedChatData._id === senderId || selectedChatData._id === recipientId)
      ) {
        addMessage(message);
      }

      const iAmSender = senderId === myId;
      const otherUser = iAmSender ? message.recipient : message.sender;
      if (!otherUser) return;

      const otherUserId = otherUser._id?.toString() ?? otherUser.toString();
      const updatedContact = {
        ...otherUser,
        _id: otherUserId,
        lastMessage: {
          content: message.content,
          messageType: message.messageType,
        },
      };

      const exists = directMessagesContacts.find(
        (c) => c._id?.toString() === otherUserId
      );

      if (exists) {
        const filtered = directMessagesContacts.filter(
          (c) => c._id?.toString() !== otherUserId
        );
        setDirectMessagesContacts([updatedContact, ...filtered]);
      } else {
        setDirectMessagesContacts([updatedContact, ...directMessagesContacts]);
      }
    };

    const handleReceiveChannelMessage = (message) => {
      const {
        selectedChatData,
        selectedChatType,
        addMessage,
        channels,
        setChannels,
      } = useAppStore.getState();

      if (
        selectedChatType === "channel" &&
        selectedChatData &&
        selectedChatData._id === message.channelId?.toString()
      ) {
        addMessage(message);
      }

      const channelId = message.channelId?.toString();
      if (!channelId || !channels) return;

      const existingChannel = channels.find(
        (c) => c._id?.toString() === channelId
      );

      if (existingChannel) {
        const updatedChannel = {
          ...existingChannel,
          lastMessage: {
            content: message.content,
            messageType: message.messageType,
          },
        };
        const filtered = channels.filter(
          (c) => c._id?.toString() !== channelId
        );
        setChannels([updatedChannel, ...filtered]);
      }
    };

    const handleNewChannel = (channel) => {
      const { addChannel } = useAppStore.getState();
      if (addChannel) addChannel(channel);
    };

    const handleIncomingCall = ({ offer, callerInfo }) => {
      const { setVideoCallStatus, setVideoCallData, setIncomingOffer } =
        useAppStore.getState();
      setVideoCallData(callerInfo);
      setIncomingOffer(offer);
      setVideoCallStatus("incoming");
    };

    newSocket.on("receiveMessage", handleReceiveMessage);
    newSocket.on("receiveChannelMessage", handleReceiveChannelMessage);
    newSocket.on("newChannel", handleNewChannel);
    newSocket.on("incoming-call", handleIncomingCall);

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
