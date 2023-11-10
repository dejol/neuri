import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../contexts/authContext";
import { Cookies } from "react-cookie";

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, logout, getAuthentication } =
    useContext(AuthContext);
    const cookies=new Cookies();

  if (!isAuthenticated && !getAuthentication()) {
    logout();
    return <Navigate to="/login" replace />;
  }

  return children;
};
