import { useState, useEffect } from "react";
import logo from "@/assets/logo.png";
import victory from "@/assets/victory.svg";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import { LOGIN_ROUTE, SIGNUP_ROUTE } from "@/utils/constants.js";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const { setUserInfo } = useAppStore();

  const messages = [
    "Ping. Typing. Delivered. Done. ⚡",
    "Your chat just got an upgrade 🚀",
    "Typing magic happening… ✨",
    "Talk faster. Laugh louder 😂",
    "Conversations that never lag 🧠",
    "Chat like you mean it 💬",
  ];

  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let i = 0;
    const current = messages[index];

    const typing = setInterval(() => {
      setText(current.slice(0, i));
      i++;
      if (i > current.length) {
        clearInterval(typing);
        setTimeout(() => {
          setIndex((prev) => (prev + 1) % messages.length);
        }, 1500);
      }
    }, 35);

    return () => clearInterval(typing);
  }, [index]);

  const validateLogin = () => {
    if (!email.length) {
      toast.error("Email is required");
      return false;
    }
    if (!password.length) {
      toast.error("Password is required");
      return false;
    }
    return true;
  };

  const validateSignup = () => {
    if (!email.length) {
      toast.error("Email is required");
      return false;
    }
    if (!password.length) {
      toast.error("Password is required");
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Password should be same");
      return false;
    }
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;
    try {
      const response = await apiClient.post(
        LOGIN_ROUTE,
        { email, password },
        { withCredentials: true },
      );
      toast.success("Login successful");
      if (response.data.user.id) {
        setUserInfo(response.data.user);
        if (response.data.user.profileSetup) {
          navigate("/chat");
        } else {
          navigate("/profile");
        }
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status === 404) toast.error("No account found with this email");
        else if (status === 400) toast.error("Invalid email or password");
        else toast.error("Login failed. Try again.");
      } else {
        toast.error("Server not reachable");
      }
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateSignup()) return;
    try {
      const response = await apiClient.post(
        SIGNUP_ROUTE,
        { email, password },
        { withCredentials: true },
      );
      toast.success("Account created successfully");
      if (response.status === 201) {
        setUserInfo(response.data.user);
        navigate("/profile");
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 409)
          toast.error("Email already registered. Please login.");
        else if (error.response.status === 400) toast.error("Invalid input");
        else toast.error("Signup failed");
      } else {
        toast.error("Server not reachable");
      }
    }
  };

  return (
    <>
     

      <div className="auth-root">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="grid-dots" />

        <div className="auth-card">
          <div className="left-panel">
            <div className="text-2xl font-bold tracking-wide">
              <span className="text-white">Nex</span>
              <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                Chat
              </span>
            </div>

            <div>
              <div className="chat-bubbles">
                <div className="bubble bubble-in">
                  Hey, are you joining the call? 👋
                </div>
                <div className="bubble bubble-out">Yes! Give me 2 mins 🚀</div>
                <div className="bubble bubble-in">
                  We got you — team's all here 😄
                </div>
              </div>
              <div className="status-row">
                <div className="status-dot" />
                <span className="status-text">3 people online right now</span>
              </div>
            </div>

            <div>
              <img
                src={victory}
                alt=""
                style={{
                  height: 56,
                  display: "block",
                  margin: "0 auto 12px",
                  opacity: 0.7,
                }}
              />
              <p className="left-tagline">Stay connected · Always</p>
            </div>
          </div>

          <div className="right-panel">

            <div className="mobile-logo text-2xl font-bold tracking-wide">
              <span className="text-white">Nex</span>
              <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                Chat
              </span>
            </div>
            {/* Typing animation */}
            <div className="typing-bar">
              {text}
              <span className="cursor" />
            </div>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="auth-tabs-list">
                <TabsTrigger value="login" className="auth-tabs-trigger">
                  Login
                </TabsTrigger>
                <TabsTrigger value="signup" className="auth-tabs-trigger">
                  Signup
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin}>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon"></span>
                    <Input
                      className="auth-input"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon"></span>
                    <Input
                      className="auth-input"
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button className="auth-btn">Sign in to NexChat</Button>
                  <p className="forgot-link">Forgot password?</p>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup}>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon"></span>
                    <Input
                      className="auth-input"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon"></span>
                    <Input
                      className="auth-input"
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon"></span>
                    <Input
                      className="auth-input"
                      type="password"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <Button className="auth-btn">Create Account</Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}
