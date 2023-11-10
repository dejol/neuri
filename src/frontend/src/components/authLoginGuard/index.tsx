import { useContext } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/authContext";
import Cookies from "universal-cookie";

export const ProtectedLoginRoute = ({ children }) => {
  const { getAuthentication, autoLogin } = useContext(AuthContext);
  const cookies=new Cookies();
  const navigate = useNavigate();
  // function getAuth() {
  //   const storedRefreshToken = cookies.get("refresh_tkn_lflw");
  //   const storedAccess = cookies.get("access_tkn_lflw");
  //   // const storedRefreshToken = window.localStorage.getItem("refresh_tkn_lflw");
  //   // const storedAccess = window.localStorage.getItem("access_tkn_lflw");
  //   const auth = storedAccess && storedRefreshToken ? true : false;
  //   return auth;
  // }
  if (autoLogin === true) {
    window.location.replace("/");
    return <Navigate to="/" replace />;
    // navigate("/flow");
  
  }

  if (getAuthentication()) {
    window.location.replace("/");
    return <Navigate to="/" replace />;
    // navigate("/flow");

  }
  // else{
  //   navigate("/login");
  // }

  return children;
};
