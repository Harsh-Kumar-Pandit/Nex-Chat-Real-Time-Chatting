import apiClient from "@/lib/api-client";
import { useAppStore } from "@/store";
import { GET_ALL_MESSAGES_ROUTES, GET_CHANNEL_MESSAGES_ROUTE, HOST } from "@/utils/constants";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { IoClose, IoDownloadOutline } from "react-icons/io5";
import { MdZoomIn, MdZoomOut } from "react-icons/md";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { getColor } from "@/lib/utils";

const MessageContainer = () => {
  const scrollRef = useRef();
  const [lightbox, setLightbox] = useState(null);
  const [zoom, setZoom] = useState(1);

  const {
    selectedChatType, selectedChatData, userInfo,
    selectedChatMessages, setSelectedChatMessages,
  } = useAppStore();

  useEffect(() => {
    const getMessages = async () => {
      try {
        const response = await apiClient.post(
          GET_ALL_MESSAGES_ROUTES,
          { id: selectedChatData._id },
          { withCredentials: true }
        );
        if (response.data.messages) setSelectedChatMessages(response.data.messages);
      } catch (error) { console.log(error); }
    };

    const getChannelMessages = async () => {
      try {
        const response = await apiClient.get(
          `${GET_CHANNEL_MESSAGES_ROUTE}/${selectedChatData._id}`,
          { withCredentials: true }
        );
        if (response.data.messages) setSelectedChatMessages(response.data.messages);
      } catch (error) { console.log(error); }
    };

    if (selectedChatData?._id) {
      if (selectedChatType === "contact") getMessages();
      if (selectedChatType === "channel") getChannelMessages();
    }
  }, [selectedChatData, selectedChatType, setSelectedChatMessages]);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
  }, [selectedChatMessages]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") closeLightbox(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const checkIfImage = (filePath) =>
    /\.(jpg|jpeg|png|gif|bmp|tiff|tif|webp|svg|ico|heic|heif)$/i.test(filePath);

  const openLightbox = (url) => { setLightbox(url); setZoom(1); document.body.style.overflow = "hidden"; };
  const closeLightbox = () => { setLightbox(null); setZoom(1); document.body.style.overflow = ""; };

  const downloadFile = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl; a.download = filename || "download";
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) { console.error("Download failed", err); }
  };

  // ── derived info ──
  const isChannel = selectedChatType === "channel";
  const messageCount = selectedChatMessages?.length ?? 0;
  const memberCount = isChannel ? (selectedChatData?.members?.length ?? 0) : null;

  const adminName = isChannel && selectedChatData?.admin
    ? selectedChatData.admin.firstName
      ? `${selectedChatData.admin.firstName} ${selectedChatData.admin.lastName ?? ""}`.trim()
      : selectedChatData.admin.email
    : null;

  const dmDisplayName = !isChannel
    ? selectedChatData?.firstName
      ? `${selectedChatData.firstName} ${selectedChatData.lastName ?? ""}`.trim()
      : selectedChatData?.email
    : null;

  const dmInitial = !isChannel
    ? selectedChatData?.firstName?.charAt(0) ?? selectedChatData?.email?.charAt(0)
    : null;

 
  const renderIntroBanner = () => (
    <div className="flex flex-col items-center gap-3 py-8 px-4 text-center">

      {isChannel ? (
        <div className="w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/20 flex items-center justify-center text-violet-300 text-2xl font-bold">
          #
        </div>
      ) : (
        <Avatar className="w-16 h-16 rounded-2xl overflow-hidden block">
          {selectedChatData?.image ? (
            <AvatarImage src={`${HOST}/${selectedChatData.image}`} className="object-cover w-full h-full" />
          ) : (
            <div className={`uppercase text-xl font-bold flex items-center justify-center w-full h-full ${getColor(selectedChatData?.color)}`}>
              {dmInitial}
            </div>
          )}
        </Avatar>
      )}

  
      <div className="flex flex-col gap-1">
        <span className="text-white font-semibold text-base">
          {isChannel ? `# ${selectedChatData?.name}` : dmDisplayName}
        </span>

        {isChannel && (
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span className="text-white/30 text-xs">
              👑 Created by <span className="text-violet-400/70">{adminName}</span>
            </span>
            <span className="text-white/10 text-xs">·</span>
            <span className="text-white/30 text-xs">
              👥 {memberCount} member{memberCount !== 1 ? "s" : ""}
            </span>
            <span className="text-white/10 text-xs">·</span>
            <span className="text-white/30 text-xs">
              💬 {messageCount} message{messageCount !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {!isChannel && (
          <span className="text-white/25 text-xs">
            {selectedChatData?.email}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 w-full max-w-xs mt-2">
        <div className="flex-1 h-px bg-white/[0.05]" />
        <span className="text-white/15 text-[10px] uppercase tracking-wider">
          {messageCount === 0 ? "Start the conversation" : "Conversation started"}
        </span>
        <div className="flex-1 h-px bg-white/[0.05]" />
      </div>

    </div>
  );

  const renderFileContent = (message, isSender) => {
    const fileUrl = `${HOST}/${message.fileUrl}`;
    const fileName = message.fileUrl?.split("/").pop();

    return (
      <div className={`inline-block rounded-2xl overflow-hidden border
        ${isSender ? "bg-[#8417ff]/10 border-[#8417ff]/30" : "bg-[#2a2b33]/60 border-white/10"}`}>
        {checkIfImage(message.fileUrl) ? (
          <div className="flex flex-col gap-2 p-1">
            <img
              src={fileUrl} alt="sent"
              onClick={() => openLightbox(fileUrl)}
              className="max-h-[280px] max-w-[320px] object-contain rounded-xl cursor-pointer"
            />
            <button
              onClick={() => downloadFile(fileUrl, fileName)}
              className={`flex items-center gap-1 text-xs px-3 py-1 rounded-md w-fit mb-1 ml-1
                ${isSender ? "bg-[#8417ff]/30 text-purple-200 hover:bg-[#8417ff]/50" : "bg-white/[0.07] text-white/60 hover:bg-white/[0.15]"}`}
            >
              <IoDownloadOutline /> Download
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-4 py-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg
              ${isSender ? "bg-[#8417ff]/30" : "bg-white/[0.07]"}`}>📄</div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-white/80 text-sm font-medium truncate max-w-[160px]">{fileName}</span>
              <span className={`text-xs mt-0.5 ${isSender ? "text-purple-400/60" : "text-white/30"}`}>File</span>
            </div>
            <button
              onClick={() => downloadFile(fileUrl, fileName)}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors shrink-0
                ${isSender ? "bg-[#8417ff]/30 hover:bg-[#8417ff]/50 text-purple-300" : "bg-white/[0.07] hover:bg-white/[0.15] text-white/50"}`}
            >
              <IoDownloadOutline className="text-base" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderDMMessages = (message) => {
    const isSender = message.sender !== selectedChatData._id;
    return (
      <div className={`flex ${isSender ? "justify-end" : "justify-start"} mb-1`}>
        <div className="flex flex-col gap-1 max-w-[55%]">
          {message.messageType === "text" && (
            <div className={`inline-block px-4 py-2.5 rounded-2xl break-words text-sm leading-relaxed
              ${isSender
                ? "bg-[#8417ff]/20 text-[#e8c0ff] border border-[#8417ff]/30 rounded-br-sm"
                : "bg-[#2a2b33] text-white/80 border border-white/10 rounded-bl-sm"}`}>
              {message.content}
            </div>
          )}
          {message.messageType === "file" && renderFileContent(message, isSender)}
          <div className={`text-[11px] text-gray-600 ${isSender ? "text-right" : "text-left"}`}>
            {moment(message.createdAt).format("LT")}
          </div>
        </div>
      </div>
    );
  };

  const renderChannelMessages = (message) => {
    const isSender = message.sender._id
      ? message.sender._id === userInfo._id
      : message.sender === userInfo._id;

    const sender = message.sender;
    const senderName = sender?.firstName
      ? `${sender.firstName} ${sender.lastName ?? ""}`.trim()
      : sender?.email;
    const senderInitial = sender?.firstName
      ? sender.firstName.charAt(0)
      : sender?.email?.charAt(0);

    return (
      <div className={`flex ${isSender ? "justify-end" : "justify-start"} mb-2 gap-2`}>
        {!isSender && (
          <div className="shrink-0 mt-auto">
            <Avatar className="w-7 h-7 rounded-full overflow-hidden block">
              {sender?.image ? (
                <AvatarImage src={`${HOST}/${sender.image}`} className="object-cover w-full h-full" />
              ) : (
                <div className={`uppercase text-xs font-semibold flex items-center justify-center w-full h-full ${getColor(sender?.color)}`}>
                  {senderInitial}
                </div>
              )}
            </Avatar>
          </div>
        )}
        <div className="flex flex-col gap-1 max-w-[55%]">
          {!isSender && (
            <span className="text-[11px] text-white/30 pl-1">{senderName}</span>
          )}
          {message.messageType === "text" && (
            <div className={`inline-block px-4 py-2.5 rounded-2xl break-words text-sm leading-relaxed
              ${isSender
                ? "bg-[#8417ff]/20 text-[#e8c0ff] border border-[#8417ff]/30 rounded-br-sm"
                : "bg-[#2a2b33] text-white/80 border border-white/10 rounded-bl-sm"}`}>
              {message.content}
            </div>
          )}
          {message.messageType === "file" && renderFileContent(message, isSender)}
          <div className={`text-[11px] text-gray-600 ${isSender ? "text-right" : "text-left"}`}>
            {moment(message.createdAt).format("LT")}
          </div>
        </div>
      </div>
    );
  };

  const renderMessages = () => {
    let lastDate = null;
    return selectedChatMessages.map((message, index) => {
      const messageDate = moment(message.createdAt).format("YYYY-MM-DD");
      const showDate = messageDate !== lastDate;
      lastDate = messageDate;
      return (
        <div key={index} className="w-full">
          {showDate && (
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-gray-500 text-[11px] px-2 shrink-0">
                {moment(message.createdAt).format("LL")}
              </span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>
          )}
          {selectedChatType === "contact" && renderDMMessages(message)}
          {selectedChatType === "channel" && renderChannelMessages(message)}
        </div>
      );
    });
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-0.5 messages-scroll">


        {renderIntroBanner()}

        {renderMessages()}
        <div ref={scrollRef} />
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center"
          onClick={closeLightbox}>
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-black/40"
            onClick={(e) => e.stopPropagation()}>
            <span className="text-white/40 text-xs truncate max-w-[60%]">{lightbox.split("/").pop()}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">
                <MdZoomOut className="text-lg" />
              </button>
              <span className="text-white/50 text-xs w-10 text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">
                <MdZoomIn className="text-lg" />
              </button>
              <button onClick={() => downloadFile(lightbox, lightbox.split("/").pop())}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">
                <IoDownloadOutline className="text-lg" />
              </button>
              <button onClick={closeLightbox}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-red-500/30 flex items-center justify-center text-white">
                <IoClose className="text-lg" />
              </button>
            </div>
          </div>
          <div className="overflow-auto flex items-center justify-center w-full h-full px-4 pt-16 pb-4"
            onClick={(e) => e.stopPropagation()}>
            <img src={lightbox} alt="preview"
              style={{ transform: `scale(${zoom})`, transformOrigin: "center", transition: "transform 0.2s" }}
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" />
          </div>
          <p className="absolute bottom-4 text-white/20 text-xs">Tap outside or press Esc to close</p>
        </div>
      )}
    </>
  );
};

export default MessageContainer;