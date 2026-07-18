import { Navigate, Outlet, useLocation } from "react-router-dom";
import AuthLoadingScreen from "../components/auth/AuthLoadingScreen.jsx";
import useAuth from "../hooks/useAuth.js";

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
