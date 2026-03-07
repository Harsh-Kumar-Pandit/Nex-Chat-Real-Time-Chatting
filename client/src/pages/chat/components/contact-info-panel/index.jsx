import { useAppStore } from "@/store";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { getColor } from "@/lib/utils";
import { HOST } from "@/utils/constants";
import { IoClose } from "react-icons/io5";
import { HiOutlineMail } from "react-icons/hi";
import { FiUser, FiUsers } from "react-icons/fi";

const ContactInfoPanel = ({ onClose }) => {
  const { selectedChatData, selectedChatType } = useAppStore();

  if (!selectedChatData) return null;

  const isChannel = selectedChatType === "channel";

  const displayName = isChannel
    ? selectedChatData.name
    : selectedChatData.firstName
    ? `${selectedChatData.firstName} ${selectedChatData.lastName ?? ""}`.trim()
    : selectedChatData.email;

  const initial = isChannel
    ? selectedChatData.name?.charAt(0).toUpperCase()
    : selectedChatData.firstName?.charAt(0).toUpperCase()
      ?? selectedChatData.email?.charAt(0).toUpperCase();

  const adminName = isChannel && selectedChatData.admin
    ? selectedChatData.admin.firstName
      ? `${selectedChatData.admin.firstName} ${selectedChatData.admin.lastName ?? ""}`.trim()
      : selectedChatData.admin.email
    : null;

  return (
    <>
      {/* Mobile Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
      />

      {/* Panel */}
      <div
        className="
        fixed right-0 top-0 h-full z-50
        w-full sm:w-[340px] md:w-[280px]
        bg-[#13141c] border-l border-white/[0.06]
        flex flex-col overflow-y-auto contacts-scroll
        animate-in slide-in-from-right duration-200
      "
      >

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/[0.05]">
          <span className="text-white/40 text-xs uppercase tracking-widest font-semibold">
            {isChannel ? "Group Info" : "Profile"}
          </span>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.06]"
          >
            <IoClose />
          </button>
        </div>

        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-3 pt-8 pb-6 px-4 border-b border-white/[0.05]">

          {isChannel ? (
            <div className="w-20 h-20 rounded-2xl bg-violet-600/20 border border-violet-500/20 flex items-center justify-center text-violet-300 text-3xl font-bold">
              #
            </div>
          ) : (
            <Avatar className="w-20 h-20 rounded-2xl overflow-hidden">
              {selectedChatData.image ? (
                <AvatarImage
                  src={`${HOST}/${selectedChatData.image}`}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div
                  className={`uppercase text-2xl font-bold flex items-center justify-center w-full h-full ${getColor(
                    selectedChatData.color
                  )}`}
                >
                  {initial}
                </div>
              )}
            </Avatar>
          )}

          <div className="flex flex-col items-center gap-1 text-center">
            <span className="text-white font-semibold text-base">
              {displayName}
            </span>

            {!isChannel && (
              <span className="flex items-center gap-1.5 text-green-400/80 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                Online
              </span>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="flex flex-col gap-3 px-4 py-4">

          {!isChannel && selectedChatData.email && (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <HiOutlineMail className="text-white/30 text-base" />
              <div className="flex flex-col min-w-0">
                <span className="text-white/20 text-[10px] uppercase tracking-wider">
                  Email
                </span>
                <span className="text-white/60 text-xs truncate">
                  {selectedChatData.email}
                </span>
              </div>
            </div>
          )}

          {isChannel && adminName && (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <FiUser className="text-white/30 text-base" />
              <div className="flex flex-col min-w-0">
                <span className="text-white/20 text-[10px] uppercase tracking-wider">
                  Created by
                </span>
                <span className="text-violet-400/70 text-xs truncate">
                  {adminName}
                </span>
              </div>
            </div>
          )}

          {/* Members */}
          {isChannel && selectedChatData.members?.length > 0 && (
            <div className="flex flex-col gap-1 mt-2">

              <div className="flex items-center gap-2 px-1 py-2">
                <FiUsers className="text-white/20 text-sm" />
                <span className="text-white/20 text-[10px] uppercase tracking-wider">
                  Members · {selectedChatData.members.length}
                </span>
              </div>

              {selectedChatData.members.map((member) => {
                const name = member.firstName
                  ? `${member.firstName} ${member.lastName ?? ""}`.trim()
                  : member.email;

                const mInitial =
                  member.firstName?.charAt(0).toUpperCase() ??
                  member.email?.charAt(0).toUpperCase();

                const isAdmin =
                  selectedChatData.admin?._id === member._id ||
                  selectedChatData.admin === member._id;

                return (
                  <div
                    key={member._id}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.03]"
                  >
                    <Avatar className="w-8 h-8 rounded-full overflow-hidden">
                      {member.image ? (
                        <AvatarImage
                          src={`${HOST}/${member.image}`}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div
                          className={`uppercase text-xs font-semibold flex items-center justify-center w-full h-full ${getColor(
                            member.color
                          )}`}
                        >
                          {mInitial}
                        </div>
                      )}
                    </Avatar>

                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-white/70 text-xs font-medium truncate">
                        {name}
                      </span>

                      {isAdmin && (
                        <span className="text-violet-400/50 text-[10px]">
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </>
  );
};

export default ContactInfoPanel;