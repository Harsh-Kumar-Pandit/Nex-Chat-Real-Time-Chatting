export const createVideoCallSlice = (set) => ({
  // "idle" | "outgoing" | "incoming" | "connected"
  videoCallStatus: "idle",
  videoCallType: "video", // "video" | "audio"
  videoCallData: undefined, // { id, email, firstName, lastName, image, color }
  localStream: undefined,
  remoteStream: undefined,
  incomingOffer: undefined,

  setVideoCallStatus: (videoCallStatus) => set({ videoCallStatus }),
  setVideoCallData: (videoCallData) => set({ videoCallData }),
  setLocalStream: (localStream) => set({ localStream }),
  setRemoteStream: (remoteStream) => set({ remoteStream }),
  setIncomingOffer: (incomingOffer) => set({ incomingOffer }),
  setVideoCallType: (videoCallType) => set({ videoCallType }),

  endVideoCall: () =>
    set({
      videoCallStatus: "idle",
      videoCallType: "video",
      videoCallData: undefined,
      localStream: undefined,
      remoteStream: undefined,
      incomingOffer: undefined,
    }),
});
