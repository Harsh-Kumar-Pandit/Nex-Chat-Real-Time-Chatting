import { GET_CONTACT_ROUTES, GET_USER_CHANNELS_ROUTE } from "@/utils/constants";
import NewDm from "./components/new-dm";
import ProfileInfo from "./components/profile-info";
import { useAppStore } from "@/store";
import apiClient from "@/lib/api-client";
import { useEffect, useState } from "react";
import ContactList from "@/components/contact-list";
import CreateChannel from "./components/create-channel";

const ContactsContainer = () => {
  const {
    setDirectMessagesContacts,
    directMessagesContacts,
    channels,
    setChannels,
  } = useAppStore();
  const [activeTab, setActiveTab] = useState("dm");

  useEffect(() => {
    const getContacts = async () => {
      try {
        const response = await apiClient.get(GET_CONTACT_ROUTES, { withCredentials: true });
        if (response.data.contacts) setDirectMessagesContacts(response.data.contacts);
      } catch (error) { console.log(error); }
    };

    const getChannels = async () => {
      try {
        const response = await apiClient.get(GET_USER_CHANNELS_ROUTE, { withCredentials: true });
        if (response.data.channels) setChannels(response.data.channels);
      } catch (error) { console.log(error); }
    };

    getContacts();
    getChannels();
  }, []);

  return (
    <div className="flex flex-col w-screen md:w-[35vw] lg:w-[30vw] xl:w-[20vw] md:min-w-[260px] h-[100dvh] bg-[#13141c] border-r border-white/[0.06]">
      <div className="px-5 pt-5 pb-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #4c1d95, #312e81)" }}>
            <svg width="16" height="16" viewBox="0 0 40 40" fill="none">
              <path d="M8 32V8L20 26V8" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 26V8L32 26V8" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5"/>
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight">
            <span className="text-white">Nex</span>
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">Chat</span>
          </span>
        </div>
      </div>

      <div className="px-3 shrink-0">
        <div className="flex bg-white/[0.04] rounded-xl p-1 border border-white/[0.06]">
          <button onClick={() => setActiveTab("dm")}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all duration-200
              ${activeTab === "dm" ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20" : "text-white/30 hover:text-white/60"}`}>
            Direct
          </button>
          <button onClick={() => setActiveTab("group")}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all duration-200
              ${activeTab === "group" ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20" : "text-white/30 hover:text-white/60"}`}>
            Groups
          </button>
        </div>
      </div>

      <div className="mx-3 mt-4 h-px bg-white/[0.05] shrink-0" />

      {activeTab === "dm" && (
        <div className="flex flex-col flex-1 min-h-0 py-3">
          <div className="flex items-center justify-between px-3 mb-2 shrink-0">
            <Title text="Direct Messages" />
            <NewDm />
          </div>
          <div className="flex-1 overflow-y-auto contacts-scroll">
            <ContactList contacts={directMessagesContacts} />
          </div>
        </div>
      )}

      {activeTab === "group" && (
        <div className="flex flex-col flex-1 min-h-0 py-3">
          <div className="flex items-center justify-between px-3 mb-2 shrink-0">
            <Title text="Groups" />
            <CreateChannel />
          </div>
          <div className="flex-1 overflow-y-auto contacts-scroll">
            <ContactList contacts={channels} isChannel={true} />
          </div>
        </div>
      )}

      <div className="shrink-0">
        <div className="mx-3 h-px bg-white/[0.05]" />
        <ProfileInfo />
      </div>

    </div>
  );
};

export default ContactsContainer;

const Title = ({ text }) => (
  <h6 className="text-[10px] uppercase tracking-[0.15em] text-white/25 font-semibold">{text}</h6>
);
