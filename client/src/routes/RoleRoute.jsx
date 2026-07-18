import { Navigate, Outlet } from "react-router-dom";
import AuthLoadingScreen from "../components/auth/AuthLoadingScreen.jsx";
import useAuth from "../hooks/useAuth.js";

function RoleRoute({ allowedRoles }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

export default RoleRoute;
