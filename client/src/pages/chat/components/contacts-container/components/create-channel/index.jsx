import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import React, { useState } from 'react'
import { FaPlus } from "react-icons/fa"
import { Input } from "@/components/ui/input"
import apiClient from "@/lib/api-client"
import { CREATE_CHANNEL_ROUTE, HOST, SEARCH_ROUTES } from "@/utils/constants"
import { Avatar, AvatarImage } from "@radix-ui/react-avatar"
import { getColor } from "@/lib/utils"
import { useAppStore } from "@/store"
import { IoClose } from "react-icons/io5"

const CreateChannel = () => {
  const { setSelectedChatType, setSelectedChatData, addChannel } = useAppStore()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1) // step 1 = name, step 2 = add members
  const [channelName, setChannelName] = useState("")
  const [searchedContacts, setSearchedContacts] = useState([])
  const [selectedMembers, setSelectedMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)

  const resetAndClose = () => {
    setOpen(false)
    setStep(1)
    setChannelName("")
    setSearchedContacts([])
    setSelectedMembers([])
  }

  const searchContacts = async (searchTerm) => {
    try {
      if (!searchTerm.trim()) { setSearchedContacts([]); return }
      setLoading(true)
      const response = await apiClient.post(SEARCH_ROUTES, { searchTerm }, { withCredentials: true })
      if (response.status === 200 && response.data.contacts) {
        // exclude already selected
        setSearchedContacts(
          response.data.contacts.filter(
            (c) => !selectedMembers.find((m) => m._id === c._id)
          )
        )
      } else {
        setSearchedContacts([])
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const addMember = (contact) => {
    setSelectedMembers((prev) => [...prev, contact])
    setSearchedContacts((prev) => prev.filter((c) => c._id !== contact._id))
  }

  const removeMember = (contactId) => {
    setSelectedMembers((prev) => prev.filter((c) => c._id !== contactId))
  }

  const createChannel = async () => {
    if (!channelName.trim()) return
    setCreating(true)
    try {
      const response = await apiClient.post(
        CREATE_CHANNEL_ROUTE,
        { name: channelName, members: selectedMembers.map((m) => m._id) },
        { withCredentials: true }
      )
      if (response.status === 201 && response.data.channel) {
        if (addChannel) addChannel(response.data.channel)
        setSelectedChatType("channel")
        setSelectedChatData(response.data.channel)
        resetAndClose()
      }
    } catch (error) {
      console.log(error)
    } finally {
      setCreating(false)
    }
  }

  const getDisplayName = (contact) =>
    contact.firstName
      ? `${contact.firstName} ${contact.lastName ?? ""}`.trim()
      : contact.email

  const getInitial = (contact) =>
    contact.firstName ? contact.firstName.charAt(0) : contact.email.charAt(0)

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

      <Dialog open={open} onOpenChange={(o) => { if (!o) resetAndClose() }}>
        <DialogContent className="bg-[#13141c] border border-white/[0.07] rounded-2xl shadow-2xl p-0 overflow-hidden max-w-md w-full">

          {/* Top accent */}
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

            {/* Step indicators */}
            <div className="flex items-center gap-2">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all
                    ${step >= s
                      ? "bg-violet-600 text-white"
                      : "bg-white/[0.06] text-white/30"
                    }`}
                  >
                    {s}
                  </div>
                  <span className={`text-xs ${step >= s ? "text-white/60" : "text-white/20"}`}>
                    {s === 1 ? "Name" : "Members"}
                  </span>
                  {s < 2 && <div className={`w-8 h-px ${step > s ? "bg-violet-500/50" : "bg-white/[0.06]"}`} />}
                </div>
              ))}
            </div>

            {/* Step 1 — Channel Name */}
            {step === 1 && (
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 text-sm pointer-events-none">#</span>
                  <Input
                    placeholder="e.g. design-team, project-alpha"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && channelName.trim()) setStep(2) }}
                    className="pl-9 h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm
                      placeholder:text-white/20
                      focus-visible:ring-1 focus-visible:ring-violet-500/60 focus-visible:border-violet-500/40
                      hover:border-white/[0.14] transition-all duration-200"
                  />
                </div>
                <button
                  onClick={() => setStep(2)}
                  disabled={!channelName.trim()}
                  className="h-11 w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600
                    hover:from-violet-500 hover:to-indigo-500
                    text-white text-sm font-semibold transition-all duration-200
                    disabled:opacity-30 disabled:cursor-not-allowed
                    shadow-lg shadow-violet-500/20"
                >
                  Continue →
                </button>
              </div>
            )}

            {/* Step 2 — Add Members */}
            {step === 2 && (
              <div className="flex flex-col gap-3">

                {/* Selected members chips */}
                {selectedMembers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
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

                {/* Search */}
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 text-sm pointer-events-none">🔍</span>
                  <Input
                    placeholder="Search members..."
                    className="pl-9 h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm
                      placeholder:text-white/20
                      focus-visible:ring-1 focus-visible:ring-violet-500/60 focus-visible:border-violet-500/40
                      hover:border-white/[0.14] transition-all duration-200"
                    onChange={(e) => searchContacts(e.target.value)}
                  />
                </div>

                {/* Results */}
                <div className="contacts-scroll h-[180px] overflow-y-auto">
                  {loading && (
                    <div className="flex items-center justify-center h-full">
                      <div className="w-5 h-5 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
                    </div>
                  )}

                  {!loading && searchedContacts.length > 0 && (
                    <div className="flex flex-col gap-0.5">
                      {searchedContacts.map((contact) => (
                        <button
                          key={contact._id}
                          onClick={() => addMember(contact)}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.05] transition-all text-left w-full group"
                        >
                          <Avatar className="w-8 h-8 rounded-full overflow-hidden block shrink-0">
                            {contact.image ? (
                              <AvatarImage src={`${HOST}/${contact.image}`} alt={getDisplayName(contact)} className="object-cover w-full h-full" />
                            ) : (
                              <div className={`uppercase text-xs font-semibold flex items-center justify-center w-full h-full ${getColor(contact.color)}`}>
                                {getInitial(contact)}
                              </div>
                            )}
                          </Avatar>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-white/80 text-sm font-medium truncate">{getDisplayName(contact)}</span>
                            {contact.firstName && <span className="text-white/25 text-xs truncate">{contact.email}</span>}
                          </div>
                          <span className="text-violet-400/0 group-hover:text-violet-400/60 text-xs transition-colors">+ Add</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {!loading && searchedContacts.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full gap-2">
                      <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/20 text-base">
                        👥
                      </div>
                      <p className="text-white/25 text-xs">Search to add members</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setStep(1)}
                    className="h-11 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] text-white/50 hover:text-white text-sm font-medium transition-all"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={createChannel}
                    disabled={creating}
                    className="flex-1 h-11 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600
                      hover:from-violet-500 hover:to-indigo-500
                      text-white text-sm font-semibold transition-all duration-200
                      disabled:opacity-50 disabled:cursor-not-allowed
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
  )
}

export default CreateChannel;