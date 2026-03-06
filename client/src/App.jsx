import "./App.css";
import "./index.css";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/auth";
import Profile from "./pages/profile";
import Chat from "./pages/chat";
import { useAppStore } from "./store";
import { AuthRoute } from "./routes/AuthRoute";
import { PrivateRoute } from "./routes/PrivateRoute";
import { useEffect, useState } from "react";
import apiClient from "./lib/api-client";
import { GET_USER_INFO } from "./utils/constants";

function App() {
  const { userInfo, setUserInfo } = useAppStore();
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  const getUserData = async () => {
    try {
      const response = await apiClient.get(GET_USER_INFO, {
        withCredentials: true,
      });
      if (response.status === 200 && response.data.id) {
      setUserInfo(response.data);
      } else {
        setUserInfo(undefined);
      }
    } catch (error) {

setUserInfo(undefined)

    } finally {
      setLoading(false);  
    }
  };

  if (!userInfo) {
    getUserData();
  } else {
    setLoading(false);
  }
}, [userInfo, setUserInfo]);
  if (loading) {
    return <div>Loading...</div>
  }
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/auth"
          element={
            <AuthRoute>
              <Auth />
            </AuthRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
