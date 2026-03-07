export const createChatSlice = (set, get) => ({
  selectedChatType: undefined,
  selectedChatData: undefined,
  selectedChatMessages: [],
  directMessagesContacts: [],
  channels: [],

  setChannels: (channels) => set({ channels }),
  setSelectedChatType: (selectedChatType) => set({ selectedChatType }),
  setSelectedChatData: (selectedChatData) => set({ selectedChatData }),
  setSelectedChatMessages: (selectedChatMessages) => set({ selectedChatMessages }),
  setDirectMessagesContacts: (directMessagesContacts) => set({ directMessagesContacts }),

  closeChat: () => set({
    selectedChatData: undefined,
    selectedChatType: undefined,
    selectedChatMessages: [],
  }),

  addChannel: (channel) => {
    const channels = get().channels;
    set({ channels: [channel, ...channels] });
  },

  addMessage: (message) => {
    const {
      selectedChatMessages,
      selectedChatType,
      selectedChatData,
      directMessagesContacts,
      channels,
    } = get();

    set({
      selectedChatMessages: [
        ...selectedChatMessages,
        {
          ...message,
          recipient: selectedChatType === "channel"
            ? message.recipient
            : message.recipient._id,
          sender: selectedChatType === "channel"
            ? message.sender
            : message.sender._id,
        },
      ],
    });

    if (selectedChatType === "contact") {
      const updatedContact = {
        ...directMessagesContacts.find((c) => c._id === selectedChatData._id),
        lastMessage: {
          content: message.content,
          messageType: message.messageType,
        },
      };
      const rest = directMessagesContacts.filter(
        (c) => c._id !== selectedChatData._id
      );
      set({ directMessagesContacts: [updatedContact, ...rest] });
    }

    if (selectedChatType === "channel") {
      const updatedChannel = {
        ...channels.find((ch) => ch._id === selectedChatData._id),
        lastMessage: {
          content: message.content,
          messageType: message.messageType,
        },
      };
      const rest = channels.filter((ch) => ch._id !== selectedChatData._id);
      set({ channels: [updatedChannel, ...rest] });
    }
  },
});