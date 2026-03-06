import { useAppStore } from "@/store";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { getColor } from "@/lib/utils";
import { HOST } from "@/utils/constants";

const ContactList = ({ contacts, isChannel = false }) => {
  const {
    selectedChatData,
    setSelectedChatData,
    setSelectedChatType,
    selectedChatType,
    setSelectedChatMessages,
  } = useAppStore();

  const handleClick = (contact) => {
    if (isChannel) setSelectedChatType("channel");
    else setSelectedChatType("contact");

    setSelectedChatData(contact);

    if (selectedChatData && selectedChatData._id !== contact._id) {
      setSelectedChatMessages([]);
    }
  };

  return (
    <div className="mt-5">
      {contacts.map((contact) => {
        const isActive =
          selectedChatData && selectedChatData._id === contact._id;

        const initial = contact.firstName
          ? contact.firstName.split("").shift()
          : contact.email.split("").shift();

        const displayName = isChannel
          ? contact.name
          : contact.firstName
          ? `${contact.firstName} ${contact.lastName ?? ""}`.trim()
          : contact.email;

        return (
          <div
            key={contact._id}
            onClick={() => handleClick(contact)}
            className={`pl-4 py-2 transition-all duration-300 cursor-pointer
              ${
                isActive
                  ? "bg-[#8417ff] hover:bg-[#8417ff]"
                  : "hover:bg-[#f1f1f111]"
              }`}
          >
            <div className="flex gap-5 items-center justify-start text-neutral-300">

              {/* Avatar — only for DMs, not channels */}
              {!isChannel && (
                <Avatar className="h-10 w-10 rounded-full overflow-hidden shrink-0">
                  {contact.image ? (
                    <AvatarImage
                      src={`${HOST}/${contact.image}`}
                      alt="profile"
                      className="object-cover w-full h-full bg-black"
                    />
                  ) : (
                    <div
                      className={`uppercase h-10 w-10 text-lg border flex items-center justify-center rounded-full
                        ${isActive ? "border-white/50 text-white" : getColor(contact.color)}`}
                    >
                      {initial}
                    </div>
                  )}
                </Avatar>
              )}

              {/* Channel icon */}
              {isChannel && (
                <div className="h-10 w-10 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/40 text-lg shrink-0">
                  #
                </div>
              )}

              {/* Name */}
              <span className={`truncate text-sm font-medium ${isActive ? "text-white" : "text-neutral-300"}`}>
                {displayName}
              </span>

            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ContactList;