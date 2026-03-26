import { useEffect, useRef, useState, useCallback } from "react";
import { useAppStore } from "@/store";
import { useSocket } from "@/context/SocketContext";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { getColor } from "@/lib/utils";
import { HOST } from "@/utils/constants";
import {
  MdCallEnd,
  MdMic,
  MdMicOff,
  MdVideocam,
  MdVideocamOff,
} from "react-icons/md";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const VideoCall = () => {
  const socket = useSocket();
  const {
    videoCallStatus,
    videoCallData,
    localStream,
    remoteStream,
    incomingOffer,
    videoCallType,
    userInfo,
    setVideoCallStatus,
    setLocalStream,
    setRemoteStream,
    endVideoCall,
  } = useAppStore();

  const peerConnectionRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const callTimerRef = useRef(null);

  const handleEndCallRef = useRef(null);
  const iceCandidateBufferRef = useRef([]);

  const cleanupCall = useCallback(() => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    const { localStream: currentLocalStream } = useAppStore.getState();
    if (currentLocalStream) {
      currentLocalStream.getTracks().forEach((track) => track.stop());
    }
    iceCandidateBufferRef.current = [];
    setCallDuration(0);
    setIsMuted(false);
    setIsCameraOff(false);
    endVideoCall();
  }, [endVideoCall]);

  const handleEndCall = useCallback(() => {
    if (!socket) {
      cleanupCall();
      return;
    }

    const { videoCallData: currentCallData } = useAppStore.getState();
    if (currentCallData) {
      socket.emit("call-ended", { to: currentCallData._id });
    }
    cleanupCall();
  }, [socket, cleanupCall]);

  handleEndCallRef.current = handleEndCall;

  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const { videoCallData: currentCallData } = useAppStore.getState();
        if (currentCallData) {
          socket.emit("ice-candidate", {
            to: currentCallData._id,
            candidate: event.candidate,
          });
        }
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === "disconnected" || pc.iceConnectionState === "failed") {
        if (handleEndCallRef.current) handleEndCallRef.current();
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [socket, setRemoteStream]);

  // Start outgoing call
  useEffect(() => {
    if (videoCallStatus !== "outgoing" || !socket || !videoCallData) return;

    let cancelled = false;

    const startCall = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: videoCallType === "video",
          audio: true,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        setLocalStream(stream);
        const pc = createPeerConnection();
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit("call-user", {
          to: videoCallData._id,
          from: userInfo.id,
          offer,
          callType: videoCallType,
          callerInfo: {
            _id: userInfo.id,
            email: userInfo.email,
            firstName: userInfo.firstName,
            lastName: userInfo.lastName,
            image: userInfo.image,
            color: userInfo.color,
          },
        });
      } catch (err) {
        console.error("Failed to start call:", err);
        cleanupCall();
      }
    };

    startCall();

    return () => {
      cancelled = true;
    };
  }, [videoCallStatus, videoCallData?._id, socket, videoCallType, userInfo, setLocalStream, createPeerConnection, cleanupCall]);

  // Handle call accepted (caller side)
  useEffect(() => {
    if (!socket) return;

    const handleCallAccepted = async ({ answer }) => {
      const pc = peerConnectionRef.current;
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));

        // Flush buffered ICE candidates
        for (const bufferedCandidate of iceCandidateBufferRef.current) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(bufferedCandidate));
          } catch (err) {
            console.error("Error adding buffered ICE candidate:", err);
          }
        }
        iceCandidateBufferRef.current = [];

        setVideoCallStatus("connected");
      }
    };

    const handleCallRejected = () => {
      cleanupCall();
    };

    const handleCallEnded = () => {
      cleanupCall();
    };

    const handleCallNotAvailable = () => {
      cleanupCall();
    };

    const handleIceCandidate = async ({ candidate }) => {
      const pc = peerConnectionRef.current;
      if (pc && pc.remoteDescription && candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Error adding ICE candidate:", err);
        }
      } else if (candidate) {
        iceCandidateBufferRef.current.push(candidate);
      }
    };

    socket.on("call-accepted", handleCallAccepted);
    socket.on("call-rejected", handleCallRejected);
    socket.on("call-ended", handleCallEnded);
    socket.on("call-not-available", handleCallNotAvailable);
    socket.on("ice-candidate", handleIceCandidate);

    return () => {
      socket.off("call-accepted", handleCallAccepted);
      socket.off("call-rejected", handleCallRejected);
      socket.off("call-ended", handleCallEnded);
      socket.off("call-not-available", handleCallNotAvailable);
      socket.off("ice-candidate", handleIceCandidate);
    };
  }, [socket, cleanupCall, setVideoCallStatus]);

  // Call timer
  useEffect(() => {
    if (videoCallStatus === "connected") {
      callTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }
    };
  }, [videoCallStatus]);

  // Attach streams to video elements
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleAcceptCall = async () => {
    if (!socket || !videoCallData || !incomingOffer) {
      cleanupCall();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoCallType === "video",
        audio: true,
      });
      setLocalStream(stream);
      const pc = createPeerConnection();
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer));

      // Flush buffered ICE candidates
      for (const bufferedCandidate of iceCandidateBufferRef.current) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(bufferedCandidate));
        } catch (err) {
          console.error("Error adding buffered ICE candidate:", err);
        }
      }
      iceCandidateBufferRef.current = [];

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("call-accepted", {
        to: videoCallData._id,
        answer,
      });

      setVideoCallStatus("connected");
    } catch (err) {
      console.error("Failed to accept call:", err);
      cleanupCall();
    }
  };

  const handleRejectCall = () => {
    if (!socket || !videoCallData) {
      cleanupCall();
      return;
    }

    socket.emit("call-rejected", { to: videoCallData._id });
    cleanupCall();
  };


  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsCameraOff(!isCameraOff);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (videoCallStatus === "idle") return null;

  const displayName = videoCallData?.firstName
    ? `${videoCallData.firstName} ${videoCallData.lastName ?? ""}`.trim()
    : videoCallData?.email;

  const initial =
    videoCallData?.firstName?.charAt(0) ?? videoCallData?.email?.charAt(0);

  return (
    <div className="fixed inset-0 z-50 bg-[#0b0c10] flex flex-col items-center justify-center">
      {/* Remote video (full background) */}
      {videoCallStatus === "connected" && videoCallType === "video" && (
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

      {/* Caller/callee info (shown when not connected or audio-only) */}
      {(videoCallStatus !== "connected" || videoCallType === "audio") && (
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="relative">
            <Avatar className="w-28 h-28 rounded-full overflow-hidden block ring-4 ring-purple-500/30">
              {videoCallData?.image ? (
                <AvatarImage
                  src={`${HOST}/${videoCallData.image}`}
                  alt="profile"
                  className="object-cover w-full h-full"
                />
              ) : (
                <div
                  className={`uppercase text-3xl font-bold flex items-center justify-center w-full h-full ${getColor(videoCallData?.color)}`}
                >
                  {initial}
                </div>
              )}
            </Avatar>
            {videoCallStatus === "outgoing" && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full animate-pulse" />
            )}
            {videoCallStatus === "incoming" && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full animate-pulse" />
            )}
          </div>
          <h2 className="text-white text-2xl font-semibold">{displayName}</h2>
          <p className="text-white/50 text-sm">
            {videoCallStatus === "outgoing" && "Calling..."}
            {videoCallStatus === "incoming" && "Incoming call..."}
            {videoCallStatus === "connected" && formatDuration(callDuration)}
          </p>
        </div>
      )}

      {/* Connected status bar */}
      {videoCallStatus === "connected" && videoCallType === "video" && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 bg-black/50 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-3">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-white/80 text-sm font-medium">
            {displayName}
          </span>
          <span className="text-white/40 text-sm">
            {formatDuration(callDuration)}
          </span>
        </div>
      )}

      {/* Local video (picture-in-picture) */}
      {localStream && videoCallType === "video" && (
        <div className="absolute top-6 right-6 z-20 w-40 h-28 md:w-52 md:h-36 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl bg-black">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover mirror"
            style={{ transform: "scaleX(-1)" }}
          />
        </div>
      )}

      {/* Incoming call buttons */}
      {videoCallStatus === "incoming" && (
        <div className="relative z-10 flex items-center gap-8 mt-10">
          <button
            onClick={handleRejectCall}
            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all shadow-lg shadow-red-500/30 hover:scale-105"
          >
            <MdCallEnd className="text-white text-3xl" />
          </button>
          <button
            onClick={handleAcceptCall}
            className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-all shadow-lg shadow-green-500/30 hover:scale-105 animate-bounce"
          >
            <MdVideocam className="text-white text-3xl" />
          </button>
        </div>
      )}

      {/* Call controls (outgoing / connected) */}
      {(videoCallStatus === "outgoing" || videoCallStatus === "connected") && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
          <button
            onClick={toggleMute}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              isMuted
                ? "bg-red-500/80 hover:bg-red-500"
                : "bg-white/10 hover:bg-white/20"
            }`}
          >
            {isMuted ? (
              <MdMicOff className="text-white text-2xl" />
            ) : (
              <MdMic className="text-white text-2xl" />
            )}
          </button>

          {videoCallType === "video" && (
            <button
              onClick={toggleCamera}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                isCameraOff
                  ? "bg-red-500/80 hover:bg-red-500"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              {isCameraOff ? (
                <MdVideocamOff className="text-white text-2xl" />
              ) : (
                <MdVideocam className="text-white text-2xl" />
              )}
            </button>
          )}

          <button
            onClick={handleEndCall}
            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all shadow-lg shadow-red-500/30 hover:scale-105"
          >
            <MdCallEnd className="text-white text-3xl" />
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoCall;
