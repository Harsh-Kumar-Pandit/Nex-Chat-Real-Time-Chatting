import { useState } from "react";
import ChatHeader from "./components/chat-header";
import MessageContainer from "./components/message-container";
import MessageBar from "./components/message-bar";
import ContactInfoPanel from "../contact-info-panel";

const ChatContainer = () => {
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <div className="flex flex-col flex-1 h-[100dvh] w-full bg-[#1c1d25] overflow-hidden">
      <ChatHeader
        onInfoClick={() => setInfoOpen((o) => !o)}
        infoOpen={infoOpen}
      />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="flex flex-col flex-1 min-h-0">
          <MessageContainer />
          <MessageBar />
        </div>
        {infoOpen && (
          <ContactInfoPanel onClose={() => setInfoOpen(false)} />
        )}
      </div>
    </div>
  );
};

export default ChatContainer;
