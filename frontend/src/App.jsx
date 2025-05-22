import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/authContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Layout from "./components/common/Layout";
import LoginForm from "./components/auth/LoginForm";
import Dashboard from "./pages/Dashboard";
import RequestForm from "./pages/RequestForm";
import RequestList from "./pages/RequestList";
import PendingRequests from "./pages/PendingRequests";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          <Route path="/login" element={<LoginForm />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="requests" element={<RequestList />} />
            <Route
              path="requests/new"
              element={
                <ProtectedRoute requiredRole="CHW">
                  <RequestForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="pending"
              element={
                <ProtectedRoute requiredRole="CHA">
                  <PendingRequests />
                </ProtectedRoute>
              }
            />
            <Route path="profile" element={<Profile />} />
          </Route>

          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
