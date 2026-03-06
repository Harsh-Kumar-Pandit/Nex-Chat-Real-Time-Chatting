import { Navigate } from "react-router-dom";
import { useAppStore } from "../store";

export const AuthRoute = ({ children }) => {
  const userInfo = useAppStore(s => s.userInfo);
  return userInfo ? <Navigate to="/chat" replace /> : children;
};