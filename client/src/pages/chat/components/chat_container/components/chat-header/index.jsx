import { useAppStore } from '@/store';
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { getColor } from "@/lib/utils";
import { HOST } from "@/utils/constants";
import { RiCloseFill } from "react-icons/ri";

const ChatHeader = ({ onInfoClick, infoOpen }) => {
  const { closeChat, selectedChatData, selectedChatType, selectedChatMessages } = useAppStore();

  const isChannel = selectedChatType === "channel";

  const displayName = isChannel
    ? selectedChatData?.name
    : selectedChatData?.firstName
    ? `${selectedChatData.firstName} ${selectedChatData.lastName ?? ""}`.trim()
    : selectedChatData?.email;

  const initial = isChannel
    ? selectedChatData?.name?.charAt(0).toUpperCase()
    : selectedChatData?.firstName?.charAt(0)
    ?? selectedChatData?.email?.charAt(0);

  const memberCount = isChannel ? selectedChatData?.members?.length : null;
  const messageCount = selectedChatMessages?.length ?? 0;

  return (
    <div className="h-[10vh] min-h-[64px] border-b border-[#2f303b]/80 bg-[#1c1d25] flex items-center justify-between px-5 md:px-8 gap-4">

      <button
        onClick={onInfoClick}
        className={`flex items-center gap-3 min-w-0 flex-1 text-left rounded-xl px-2 py-1.5 -ml-2 transition-all
          ${infoOpen ? "bg-white/[0.05]" : "hover:bg-white/[0.03]"}`}
      >
        <div className="relative shrink-0">
          {isChannel ? (
            <div className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/50 text-lg font-semibold">
              #
            </div>
          ) : (
            <Avatar className="w-10 h-10 rounded-full overflow-hidden block">
              {selectedChatData?.image ? (
                <AvatarImage
                  src={`${HOST}/${selectedChatData.image}`}
                  alt="profile"
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className={`uppercase text-sm font-semibold flex items-center justify-center w-full h-full ${getColor(selectedChatData?.color)}`}>
                  {initial}
                </div>
              )}
            </Avatar>
          )}
        </div>

        <div className="flex flex-col min-w-0">
          <span className="text-white text-sm font-semibold truncate leading-tight">
            {displayName}
          </span>
          {isChannel ? (
            <div className="flex items-center gap-2">
              <span className="text-white/30 text-[11px]">{memberCount} members</span>
              <span className="text-white/10 text-[11px]">·</span>
              <span className="text-white/20 text-[11px]">{messageCount} messages</span>
            </div>
          ) : (
            <span className="text-green-400/80 text-[11px]">Online</span>
          )}
        </div>
      </button>

      <div className="flex items-center gap-2">
        <button
          onClick={closeChat}
          className="w-9 h-9 rounded-xl text-white/30 hover:text-red-400 hover:bg-red-500/[0.08] flex items-center justify-center transition-all duration-200 shrink-0"
        >
          <RiCloseFill className="text-xl" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
