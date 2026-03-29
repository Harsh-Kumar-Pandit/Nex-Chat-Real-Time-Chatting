import { useAppStore } from "@/store";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { getColor } from "@/lib/utils";
import { HOST } from "@/utils/constants";

const ContactList = ({ contacts = [], isChannel = false }) => {
  const {
    selectedChatData,
    setSelectedChatData,
    setSelectedChatType,
    setSelectedChatMessages,
  } = useAppStore();

  const handleClick = (contact) => {
    setSelectedChatType(isChannel ? "channel" : "contact");
    setSelectedChatData(contact);
    if (selectedChatData && selectedChatData._id !== contact._id) {
      setSelectedChatMessages([]);
    }
  };

  return (
    <div className="mt-2">
      {contacts.map((contact) => {
        const isActive = selectedChatData && selectedChatData._id === contact._id;

        const displayName = isChannel
          ? contact.name
          : contact.firstName
          ? `${contact.firstName} ${contact.lastName ?? ""}`.trim()
          : contact.email;

        const initial = isChannel
          ? contact.name?.charAt(0).toUpperCase()
          : contact.firstName
          ? contact.firstName.charAt(0).toUpperCase()
          : contact.email?.charAt(0).toUpperCase();

        const lastMsg = contact.lastMessage;
        const lastPreview = lastMsg
          ? lastMsg.messageType === "file"
            ? "📎 File"
            : lastMsg.content?.length > 28
            ? lastMsg.content.slice(0, 28) + "..."
            : lastMsg.content
          : null;

        return (
          <div
            key={contact._id}
            onClick={() => handleClick(contact)}
            className={`pl-4 pr-3 py-2.5 transition-all duration-200 cursor-pointer rounded-xl mx-1 mb-0.5
              ${isActive ? "bg-[#8417ff]" : "hover:bg-[#f1f1f111]"}`}
          >
            <div className="flex gap-3 items-center">

              {!isChannel && (
                // ✅ AvatarFallback shows initial when image is missing or broken
                <Avatar className="h-10 w-10 rounded-full overflow-hidden shrink-0">
                  <AvatarImage
                    src={contact.image ? `${HOST}/${contact.image}` : undefined}
                    alt="profile"
                    className="object-cover w-full h-full"
                  />
                  <AvatarFallback
                    className={`uppercase h-10 w-10 text-lg border flex items-center justify-center rounded-full
                      ${isActive ? "border-white/30 text-white bg-white/10" : getColor(contact.color)}`}
                  >
                    {initial}
                  </AvatarFallback>
                </Avatar>
              )}

              {isChannel && (
                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-lg font-semibold shrink-0 border
                  ${isActive ? "bg-white/10 border-white/20 text-white" : "bg-white/[0.05] border-white/[0.08] text-white/40"}`}>
                  #
                </div>
              )}

              <div className="flex flex-col min-w-0 flex-1">
                <span className={`truncate text-sm font-medium leading-tight
                  ${isActive ? "text-white" : "text-neutral-300"}`}>
                  {displayName}
                </span>
                {lastPreview && (
                  <span className={`truncate text-xs mt-0.5 leading-tight
                    ${isActive ? "text-white/60" : "text-white/25"}`}>
                    {lastPreview}
                  </span>
                )}
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ContactList;
