import { useAppStore } from '@/store';
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { getColor } from "@/lib/utils";
import { HOST } from "@/utils/constants";
import { RiCloseFill } from "react-icons/ri";
import { IoCallOutline, IoVideocamOutline } from "react-icons/io5";
import { HiOutlineDotsVertical } from "react-icons/hi";

const ChatHeader = () => {
  const { closeChat, selectedChatData, selectedChatType } = useAppStore();

  const displayName = selectedChatType === "contact" && selectedChatData?.firstName
    ? `${selectedChatData.firstName} ${selectedChatData.lastName ?? ""}`.trim()
    : selectedChatData?.email;

  const initial = selectedChatData?.firstName
    ? selectedChatData.firstName.split("").shift()
    : selectedChatData?.email?.split("").shift();

  return (
    <div className="h-[10vh] min-h-[64px] border-b border-[#2f303b]/80 bg-[#1c1d25] flex items-center justify-between px-5 md:px-8 gap-4">

      
      <div className="flex items-center gap-3 min-w-0">

      
        <div className="relative shrink-0">
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
        </div>

        <div className="flex flex-col min-w-0">
          <span className="text-white text-sm font-semibold truncate leading-tight">
            {displayName}
          </span>
          <span className="text-green-400/80 text-[11px] leading-tight">
            Online
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">

        <button
          onClick={closeChat}
          className="w-9 h-9 rounded-xl text-white/30 hover:text-red-400 hover:bg-red-500/[0.08] flex items-center justify-center transition-all duration-200"
        >
          <RiCloseFill className="text-xl" />
        </button>
      </div>

    </div>
  );
};

export default ChatHeader;