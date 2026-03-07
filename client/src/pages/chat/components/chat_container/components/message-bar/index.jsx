import { useSocket } from "@/context/SocketContext";
import apiClient from "@/lib/api-client";
import { useAppStore } from "@/store";
import { UPLOAD_FILE_ROUTES } from "@/utils/constants";
import EmojiPicker from "emoji-picker-react";
import React, { useEffect, useRef, useState } from "react";
import { FiPaperclip } from "react-icons/fi";
import { HiOutlineEmojiHappy } from "react-icons/hi";
import { IoSend } from "react-icons/io5";

const MessageBar = () => {
  const emojiRef = useRef();
  const fileInputRef = useRef();

  const [message, setMessage] = useState("");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  const { selectedChatType, selectedChatData, userInfo } = useAppStore();
  const socket = useSocket();

  const handelAddEmoji = (emoji) => {
    setMessage((msg) => msg + emoji.emoji);
  };

  const handelSendMessage = async () => {
    if (!message.trim()) return;

    if (selectedChatType === "contact") {
      socket.emit("sendMessage", {
        sender: userInfo.id,
        content: message,
        recipient: selectedChatData._id,
        messageType: "text",
        fileUrl: undefined,
      });
    } else if (selectedChatType === "channel") {
      socket.emit("sendChannelMessage", {
        sender: userInfo.id,
        content: message,
        channelId: selectedChatData._id,
        messageType: "text",
        fileUrl: undefined,
      });
    }

    setMessage("");
  };

  const handelAttachmentClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleAttachmentChange = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post(UPLOAD_FILE_ROUTES, formData, {
        withCredentials: true,
      });

      if (response.status === 200 && response.data) {
        if (selectedChatType === "contact") {
          socket.emit("sendMessage", {
            sender: userInfo.id,
            content: undefined,
            recipient: selectedChatData._id,
            messageType: "file",
            fileUrl: response.data.filePath,
          });
        } else if (selectedChatType === "channel") {
          socket.emit("sendChannelMessage", {
            sender: userInfo.id,
            content: undefined,
            channelId: selectedChatData._id,
            messageType: "file",
            fileUrl: response.data.filePath,
          });
        }
      }
      // reset input
      event.target.value = "";
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setEmojiPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="h-[10vh] bg-[#1b1c24] border-t border-[#2f303b] flex items-center px-4 md:px-8">
      <div className="flex items-center w-full bg-[#2a2b33] rounded-full px-4 py-2 gap-3">

        <input
          type="text"
          value={message}
          placeholder="Enter message"
          className="flex-1 bg-transparent outline-none text-white placeholder:text-neutral-400"
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handelSendMessage();
            }
          }}
        />

        <button className="text-neutral-400 hover:text-white transition" onClick={handelAttachmentClick}>
          <FiPaperclip size={20} />
          <input type="file" className="hidden" ref={fileInputRef} onChange={handleAttachmentChange} />
        </button>

        <button className="text-neutral-400 hover:text-white transition" onClick={() => setEmojiPickerOpen(true)}>
          <HiOutlineEmojiHappy size={22} />
        </button>

        <div className="absolute bottom-16 right-0" ref={emojiRef}>
          <EmojiPicker
            theme="dark"
            open={emojiPickerOpen}
            onEmojiClick={handelAddEmoji}
            autoFocusSearch={false}
          />
        </div>
      </div>

      <button
        className="ml-3 bg-gradient-to-r from-purple-500 to-purple-700 p-3 rounded-xl hover:scale-105 transition"
        onClick={handelSendMessage}
      >
        <IoSend className="text-white text-xl" />
      </button>
    </div>
  );
};

export default MessageBar;