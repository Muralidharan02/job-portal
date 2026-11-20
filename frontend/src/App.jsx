
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { offlineMode } from "./api";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import JobDetails from "./pages/JobDetails";
import PostJob from "./pages/PostJob";
import { MyApplications, ReceivedApplications } from "./pages/Dashboards";

// Protected Route
function Protected({ children, role }) {
  const { user } = useAuth();

  if (!user) {
    return (
      <main className="section">
        <h2>Please login first</h2>
        <p>You need an account to access this page.</p>
      </main>
    );
  }

  if (role && user.role !== role) {
    return (
      <main className="section">
        <h2>Access denied</h2>
        <p>This page is not available for your account type.</p>
      </main>
    );
  }

  return children;
}

// Application Layout
function Layout() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/login"
          element={<Auth mode="login" />}
        />

        <Route
          path="/register"
          element={<Auth mode="register" />}
        />

        <Route
          path="/jobs/:id"
          element={<JobDetails />}
        />

        {/* Employer Routes */}
        <Route
          path="/post-job"
          element={
            <Protected role="employer">
              <PostJob />
            </Protected>
          }
        />

        <Route
          path="/received"
          element={
            <Protected role="employer">
              <ReceivedApplications />
            </Protected>
          }
        />

        {/* Jobseeker Routes */}
        <Route
          path="/my-applications"
          element={
            <Protected role="jobseeker">
              <MyApplications />
            </Protected>
          }
        />

        {offlineMode && (
          <Route
            path="/admin"
            element={
              <Protected role="admin">
                <Admin />
              </Protected>
            }
          />
        )}

        {/* 404 Page */}
        <Route
          path="*"
          element={
            <main className="section">
              <h1>Page not found</h1>
            </main>
          }
        />
      </Routes>
    </>
  );
}

// Main App
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </BrowserRouter>
  );
}
