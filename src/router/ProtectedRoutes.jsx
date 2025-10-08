import { Navigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = Cookies.get("token");

  const isAuthenticated = !!token;

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }
  return children;
};

export default ProtectedRoute;
