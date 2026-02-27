import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import GlobalLoader from "./GlobalLoader";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <GlobalLoader />;
  }

  // 1. Not logged in? Send to login but remember where they wanted to go
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Logged in but wrong role? Send to dashboard instead of login
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // 3. Everything is fine, show the page
  return children;
};

export default ProtectedRoute;
