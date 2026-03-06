import { Navigate } from "react-router-dom";
import { useAppStore } from "../store";

export const PrivateRoute = ({ children }) => {
  const userInfo = useAppStore(s => s.userInfo);
  return userInfo ? children : <Navigate to="/auth" replace />;
};