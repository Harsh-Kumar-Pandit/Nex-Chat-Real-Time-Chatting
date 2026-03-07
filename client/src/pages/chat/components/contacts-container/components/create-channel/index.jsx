import {
  Tooltip, TooltipContent, TooltipTrigger, TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import apiClient from "@/lib/api-client";
import { CREATE_CHANNEL_ROUTE, GET_ALL_CONTACT_ROUTES, HOST } from "@/utils/constants";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { getColor } from "@/lib/utils";
import { useAppStore } from "@/store";
import { IoClose } from "react-icons/io5";

const CreateChannel = () => {
  const { setSelectedChatType, setSelectedChatData, addChannel } = useAppStore();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [channelName, setChannelName] = useState("");
  const [allContacts, setAllContacts] = useState([]);
  const [searchedContacts, setSearchedContacts] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const resetAndClose = () => {
    setOpen(false);
    setStep(1);
    setChannelName("");
    setSelectedMembers([]);
    setSearchedContacts([]);
  };

  useEffect(() => {
    const getContacts = async () => {
      try {
        const response = await apiClient.get(GET_ALL_CONTACT_ROUTES, {
          withCredentials: true,
        });
        setAllContacts(response.data.contacts || []);
      } catch (error) {
        console.log(error);
      }
    };
    if (open) getContacts();
  }, [open]);

  // ✅ FIXED: search against firstName/lastName/email (full user objects)
const searchContacts = (term) => {
  setSearchTerm(term);
  if (!term.trim()) {
    setSearchedContacts([]);
    return;
  }
  const t = term.toLowerCase();
  const results = allContacts.filter((contact) => {
    const name = `${contact.firstName || ""} ${contact.lastName || ""}`.toLowerCase();
    const email = contact.email?.toLowerCase() || "";
    return name.includes(t) || email.includes(t);
  });
  const filtered = results.filter(
    (c) => !selectedMembers.find((m) => m._id === c._id)
  );
  setSearchedContacts(filtered);
};
  const addMember = (contact) => {
    setSelectedMembers((prev) => [...prev, contact]);
    setSearchedContacts((prev) => prev.filter((c) => c._id !== contact._id));
  };

const removeMember = (id) => {
  const removedContact = selectedMembers.find((m) => m._id === id);
  setSelectedMembers((prev) => prev.filter((m) => m._id !== id));
  
  // ✅ Add removed contact back to results if search is active
  if (searchTerm.trim() && removedContact) {
    setSearchedContacts((prev) => [...prev, removedContact]);
  }
};

  const getDisplayName = (contact) =>
    contact.firstName
      ? `${contact.firstName} ${contact.lastName ?? ""}`.trim()
      : contact.email;

  const getInitial = (contact) =>
    contact.firstName ? contact.firstName.charAt(0) : contact.email?.charAt(0);

  const createChannel = async () => {
    if (!channelName.trim()) return;
    setCreating(true);
    try {
      const response = await apiClient.post(
        CREATE_CHANNEL_ROUTE,
        { 
          name: channelName,
          members: selectedMembers.map((m) => m._id),
        },
        { withCredentials: true }
      );
      if (response.status === 201 && response.data.channel) {
        if (addChannel) addChannel(response.data.channel);
        setSelectedChatType("channel");
        setSelectedChatData(response.data.channel);
        resetAndClose();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-1.5 text-white/40 hover:text-white/90 transition-all duration-200 group"
            >
              <FaPlus className="text-[11px] group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-[#1c1b1e] border border-white/10 text-white text-xs px-3 py-1.5 rounded-lg">
            Create Group
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={open} onOpenChange={(o) => { if (!o) resetAndClose(); }}>
        <DialogContent className="bg-[#13141c] border border-white/[0.07] rounded-2xl shadow-2xl p-0 overflow-hidden max-w-md w-full">

          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-70" />

          <div className="p-6 flex flex-col gap-5">
            <DialogHeader>
              <DialogTitle className="text-white font-semibold text-lg tracking-tight">
                Create Group
              </DialogTitle>
              <DialogDescription className="text-white/30 text-sm mt-0.5">
                {step === 1 ? "Give your group a name" : "Add members to your group"}
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-2">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all
                    ${step >= s ? "bg-violet-600 text-white" : "bg-white/[0.06] text-white/30"}`}>
                    {s}
                  </div>
                  <span className={`text-xs ${step >= s ? "text-white/60" : "text-white/20"}`}>
                    {s === 1 ? "Name" : "Members"}
                  </span>
                  {s < 2 && <div className={`w-8 h-px ${step > s ? "bg-violet-500/50" : "bg-white/[0.06]"}`} />}
                </div>
              ))}
            </div>

            {step === 1 && (
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 text-sm pointer-events-none">#</span>
                  <Input
                    placeholder="e.g. design-team, project-alpha"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && channelName.trim()) setStep(2); }}
                    className="pl-9 h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm
                      placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-violet-500/60
                      focus-visible:border-violet-500/40 hover:border-white/[0.14] transition-all duration-200"
                  />
                </div>
                <button
                  onClick={() => setStep(2)}
                  disabled={!channelName.trim()}
                  className="h-11 w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600
                    hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold
                    transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed
                    shadow-lg shadow-violet-500/20"
                >
                  Continue →
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-3">

                {selectedMembers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2.5 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                    {selectedMembers.map((member) => (
                      <div key={member._id}
                        className="flex items-center gap-1.5 bg-violet-600/20 border border-violet-500/30 text-violet-300 text-xs px-2.5 py-1 rounded-full"
                      >
                        <span>{getDisplayName(member)}</span>
                        <button onClick={() => removeMember(member._id)} className="text-violet-400/60 hover:text-violet-300 transition-colors">
                          <IoClose className="text-xs" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 text-sm pointer-events-none">🔍</span>
                  <Input
                    placeholder="Search members..."
                    className="pl-9 h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm
                      placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-violet-500/60
                      focus-visible:border-violet-500/40 hover:border-white/[0.14] transition-all duration-200"
                    onChange={(e) => searchContacts(e.target.value)}
                  />
                </div>

                <div className="contacts-scroll h-[200px] overflow-y-auto rounded-xl border border-white/[0.06] bg-white/[0.02]">
                  {searchedContacts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2">
                      <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/20 text-base">👥</div>
                      <p className="text-white/25 text-xs">Search to add members</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-0.5 p-1">
                      {searchedContacts.map((contact) => (
                        <button
                          key={contact._id}
                          onClick={() => addMember(contact)}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.05] transition-all text-left w-full group"
                        >
                          <Avatar className="w-8 h-8 rounded-full overflow-hidden block shrink-0">
                            {contact.image ? (
                              <AvatarImage
                                src={`${HOST}/${contact.image}`}
                                alt={getDisplayName(contact)}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className={`uppercase text-xs font-semibold flex items-center justify-center w-full h-full ${getColor(contact.color)}`}>
                                {getInitial(contact)}
                              </div>
                            )}
                          </Avatar>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-white/80 text-sm font-medium truncate">{getDisplayName(contact)}</span>
                            <span className="text-white/25 text-xs truncate">{contact.email}</span>
                          </div>
                          <span className="text-violet-400/0 group-hover:text-violet-400/60 text-xs transition-colors shrink-0">+ Add</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setStep(1)}
                    className="h-11 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] text-white/50 hover:text-white text-sm font-medium transition-all"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={createChannel}
                    disabled={creating || selectedMembers.length === 0}
                    className="flex-1 h-11 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600
                      hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold
                      transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed
                      shadow-lg shadow-violet-500/20"
                  >
                    {creating ? "Creating..." : `Create Group${selectedMembers.length > 0 ? ` (${selectedMembers.length})` : ""}`}
                  </button>
                </div>

              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateChannel;