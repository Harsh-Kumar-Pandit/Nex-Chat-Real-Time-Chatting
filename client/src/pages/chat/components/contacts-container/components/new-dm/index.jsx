import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import apiClient from "@/lib/api-client";
import { HOST, SEARCH_ROUTES } from "@/utils/constants";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { getColor } from "@/lib/utils";
import { useAppStore } from "@/store";

const NewDm = () => {
  const {
    setSelectedChatType,
    setSelectedChatData,
    directMessagesContacts,
    setDirectMessagesContacts,
  } = useAppStore();

  const [openNewContactModal, setOpenNewContactModal] = useState(false);
  const [searchedContacts, setSearchedContacts] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchContacts = async (searchTerm) => {
    try {
      if (!searchTerm.trim()) {
        setSearchedContacts([]);
        return;
      }

      setLoading(true);

      const response = await apiClient.post(
        SEARCH_ROUTES,
        { searchTerm },
        { withCredentials: true }
      );

      if (response.status === 200 && response.data.contacts) {
        setSearchedContacts(response.data.contacts);
      } else {
        setSearchedContacts([]);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = (contact) =>
    contact.firstName
      ? `${contact.firstName} ${contact.lastName ?? ""}`.trim()
      : contact.email;

  const getSubLabel = (contact) =>
    contact.firstName ? contact.email : null;

  const getInitial = (contact) =>
    contact.firstName
      ? contact.firstName.charAt(0)
      : contact.email?.charAt(0) || "?";

  const selectNewContact = (contact) => {
    setOpenNewContactModal(false);

    // prevent duplicate contacts
    const exists = directMessagesContacts.find(
      (c) => c._id === contact._id
    );

    if (!exists) {
      setDirectMessagesContacts([contact, ...directMessagesContacts]);
    }

    setSelectedChatType("contact");
    setSelectedChatData(contact);
    setSearchedContacts([]);
  };

  return (
    <div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setOpenNewContactModal(true)}
              className="flex items-center gap-1.5 text-white/40 hover:text-white/90 transition-all duration-200 group"
            >
              <FaPlus className="text-[11px] group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="bg-[#67666b] border border-white/10 text-white text-xs px-3 py-1.5 rounded-lg"
          >
            New Direct Message
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog
        open={openNewContactModal}
        onOpenChange={(open) => {
          setOpenNewContactModal(open);
          if (!open) setSearchedContacts([]);
        }}
      >
        <DialogContent className="bg-[#13141c] border border-white/[0.07] rounded-2xl shadow-2xl p-0 overflow-hidden max-w-md w-full">
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-70" />

          <div className="p-6 flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle className="text-white font-semibold text-lg tracking-tight">
                New Message
              </DialogTitle>
              <DialogDescription className="text-white/30 text-sm mt-0.5">
                Search for a contact to start a conversation
              </DialogDescription>
            </DialogHeader>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 text-sm pointer-events-none">
                🔍
              </span>

              <Input
                placeholder="Search by name or email..."
                className="pl-9 h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm
                placeholder:text-white/20
                focus-visible:ring-1 focus-visible:ring-violet-500/60 focus-visible:border-violet-500/40
                hover:border-white/[0.14] transition-all duration-200"
                onChange={(e) => searchContacts(e.target.value)}
              />
            </div>

            <div className="contacts-scroll h-[260px] overflow-y-auto">
              {loading && (
                <div className="flex items-center justify-center h-full">
                  <div className="w-5 h-5 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
                </div>
              )}

              {!loading && searchedContacts.length > 0 && (
                <div className="flex flex-col gap-0.5 pr-1">
                  {searchedContacts.map((contact) => (
                    <button
                      key={contact._id}
                      onClick={() => selectNewContact(contact)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.05] active:bg-white/[0.08] transition-all duration-150 text-left w-full group"
                    >
                      <Avatar className="w-9 h-9 rounded-full overflow-hidden block shrink-0">
                        {contact.image ? (
                          <AvatarImage
                            src={`${HOST}/${contact.image}`}
                            alt={getDisplayName(contact)}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div
                            className={`uppercase text-sm font-semibold flex items-center justify-center w-full h-full ${getColor(
                              contact.color
                            )}`}
                          >
                            {getInitial(contact)}
                          </div>
                        )}
                      </Avatar>

                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-white/90 text-sm font-medium truncate leading-tight">
                          {getDisplayName(contact)}
                        </span>

                        {getSubLabel(contact) && (
                          <span className="text-white/30 text-xs truncate mt-0.5 leading-tight">
                            {getSubLabel(contact)}
                          </span>
                        )}
                      </div>

                      <span className="text-white/0 group-hover:text-white/20 text-xs transition-colors shrink-0">
                        ›
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {!loading && searchedContacts.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/20 text-xl">
                    💬
                  </div>
                  <p className="text-white/30 text-sm font-medium">
                    No contacts found
                  </p>
                  <p className="text-white/15 text-xs">
                    Search above to find someone
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewDm;
