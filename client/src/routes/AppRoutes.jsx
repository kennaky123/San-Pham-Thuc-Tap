import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AuthLoadingScreen from "../components/auth/AuthLoadingScreen.jsx";
import DashboardSkeleton from "../components/dashboard/DashboardSkeleton.jsx";
import TicketListSkeleton from "../components/ticket/TicketListSkeleton.jsx";
import CreateTicketPageSkeleton from "../components/ticket/create/CreateTicketPageSkeleton.jsx";
import TicketDetailSkeleton from "../components/ticket/detail/TicketDetailSkeleton.jsx";
import { getDefaultPathForRole } from "../constants/roles.js";
import useAuth from "../hooks/useAuth.js";
import AppLayout from "../layouts/AppLayout.jsx";
import UnauthorizedPage from "../pages/UnauthorizedPage.jsx";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage.jsx";
import LoginPage from "../pages/auth/LoginPage.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import RoleRoute from "./RoleRoute.jsx";

const AdminDashboardPage = lazy(
  () => import("../pages/admin/AdminDashboardPage.jsx"),
);
const AdminTicketsPage = lazy(
  () => import("../pages/admin/AdminTicketsPage.jsx"),
);
const AdminUsersPage = lazy(
  () => import("../pages/admin/AdminUsersPage.jsx"),
);
const CreateTicketPage = lazy(
  () => import("../pages/user/CreateTicketPage.jsx"),
);
const TicketDetailPage = lazy(
  () => import("../pages/ticket/TicketDetailPage.jsx"),
);
const ProfilePage = lazy(() => import("../pages/ProfilePage.jsx"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage.jsx"));
const UserOverviewPage = lazy(() => import("../pages/user/UserOverviewPage.jsx"));
const UserTicketsPage = lazy(() => import("../pages/user/UserTicketsPage.jsx"));
const TechnicianOverviewPage = lazy(() => import("../pages/technician/TechnicianOverviewPage.jsx"));
const TechnicianAllTicketsPage = lazy(() => import("../pages/technician/TechnicianAllTicketsPage.jsx"));
const TechnicianAssignedPage = lazy(() => import("../pages/technician/TechnicianAssignedPage.jsx"));
const TechnicianInProgressPage = lazy(() => import("../pages/technician/TechnicianInProgressPage.jsx"));
const TechnicianHistoryPage = lazy(() => import("../pages/technician/TechnicianHistoryPage.jsx"));
const AdminTechniciansPage = lazy(() => import("../pages/admin/AdminTechniciansPage.jsx"));
const AdminCategoriesPage = lazy(() => import("../pages/admin/AdminCategoriesPage.jsx"));
const AdminReportsPage = lazy(() => import("../pages/admin/AdminReportsPage.jsx"));
const NetworkTopologyPage = lazy(() => import("../pages/NetworkTopologyPage.jsx"));

function StandardPageRoute({ children }) {
  return <Suspense fallback={<TicketListSkeleton />}>{children}</Suspense>;
}

function AdminDashboardRoute() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <AdminDashboardPage />
    </Suspense>
  );
}

function AdminTicketsRoute() {
  return (
    <Suspense fallback={<TicketListSkeleton />}>
      <AdminTicketsPage />
    </Suspense>
  );
}

function AdminUsersRoute() {
  return (
    <Suspense fallback={<TicketListSkeleton />}>
      <AdminUsersPage />
    </Suspense>
  );
}

function CreateTicketRoute() {
  return (
    <Suspense fallback={<CreateTicketPageSkeleton />}>
      <CreateTicketPage />
    </Suspense>
  );
}

function TicketDetailRoute() {
  return (
    <Suspense fallback={<TicketDetailSkeleton />}>
      <TicketDetailPage />
    </Suspense>
  );
}

function RootRedirect() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  return (
    <Navigate
      to={isAuthenticated ? getDefaultPathForRole(user.role) : "/login"}
      replace
    />
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="unauthorized" element={<UnauthorizedPage />} />
          <Route
            path="profile"
            element={<StandardPageRoute><ProfilePage /></StandardPageRoute>}
          />
          <Route
            path="topology"
            element={<StandardPageRoute><NetworkTopologyPage /></StandardPageRoute>}
          />

          <Route element={<RoleRoute allowedRoles={["user"]} />}>
            <Route
              path="user/overview"
              element={<StandardPageRoute><UserOverviewPage /></StandardPageRoute>}
            />
            <Route
              path="user/tickets/new"
              element={<CreateTicketRoute />}
            />
            <Route
              path="user/tickets"
              element={<StandardPageRoute><UserTicketsPage /></StandardPageRoute>}
            />
            <Route
              path="user/tickets/:ticketId"
              element={<TicketDetailRoute />}
            />
          </Route>

          <Route element={<RoleRoute allowedRoles={["technician"]} />}>
            <Route
              path="technician/overview"
              element={<StandardPageRoute><TechnicianOverviewPage /></StandardPageRoute>}
            />
            <Route
              path="technician/tickets/all"
              element={<StandardPageRoute><TechnicianAllTicketsPage /></StandardPageRoute>}
            />
            <Route
              path="technician/tickets/assigned"
              element={<StandardPageRoute><TechnicianAssignedPage /></StandardPageRoute>}
            />
            <Route
              path="technician/tickets/in-progress"
              element={<StandardPageRoute><TechnicianInProgressPage /></StandardPageRoute>}
            />
            <Route
              path="technician/tickets/:ticketId"
              element={<TicketDetailRoute />}
            />
            <Route
              path="technician/history"
              element={<StandardPageRoute><TechnicianHistoryPage /></StandardPageRoute>}
            />
          </Route>

          <Route element={<RoleRoute allowedRoles={["admin"]} />}>
            <Route
              path="admin/dashboard"
              element={<AdminDashboardRoute />}
            />
            <Route
              path="admin/tickets"
              element={<AdminTicketsRoute />}
            />
            <Route
              path="admin/tickets/:ticketId"
              element={<TicketDetailRoute />}
            />
            <Route
              path="admin/users"
              element={<AdminUsersRoute />}
            />
            <Route
              path="admin/technicians"
              element={<StandardPageRoute><AdminTechniciansPage /></StandardPageRoute>}
            />
            <Route
              path="admin/categories"
              element={<StandardPageRoute><AdminCategoriesPage /></StandardPageRoute>}
            />
            <Route
              path="admin/reports"
              element={<StandardPageRoute><AdminReportsPage /></StandardPageRoute>}
            />
          </Route>

          <Route
            path="*"
            element={<StandardPageRoute><NotFoundPage /></StandardPageRoute>}
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
