import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Context Provider
import { AuthProvider, useAuth } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/common/Home";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Dashboard from "./pages/Dashboard";
import StudentProfile from "./pages/student/StudentProfile";
import JoinCampus from "./pages/student/JoinCampus";
import PersonalAssessment from "./pages/student/PersonalAssessment";
import Results from "./pages/common/Results";
import Assessment from "./pages/common/Assessment";
import Campus from "./pages/student/Campus";
import SmoothScroll from "./components/SmoothScroll";

/* ---------------- App Layout ---------------- */
const AppLayout = ({ children }) => {
  const location = useLocation();
  const { loading } = useAuth(); // Access loading state from context

  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/profile") ||
    location.pathname.startsWith("/assessment") ||
    location.pathname.startsWith("/personal-assessment") ||
    location.pathname.startsWith("/results") ||
    location.pathname.startsWith("/campus");

  // Prevent UI flicker while checking localStorage/token on refresh
  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <SmoothScroll>
      {!hideNavbar && <Navbar />}
      {!hideNavbar ? <Layout>{children}</Layout> : children}
    </SmoothScroll>
  );
};

/* ---------------- App ---------------- */
const App = () => {
  const [toastPosition, setToastPosition] = useState("bottom-right");

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setToastPosition("top-center");
      } else {
        setToastPosition("bottom-right");
      }
    };

    // Set initial position
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    // 1. AuthProvider must be INSIDE BrowserRouter or OUTSIDE.
    // Usually, we put it outside or inside main.jsx.
    <AuthProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            {/* PUBLIC */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/join-campus/:institutionId"
              element={<JoinCampus />}
            />

            {/* STUDENT PROFILE */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute
                  allowedRoles={["student", "general", "campus_student"]}
                >
                  <StudentProfile />
                </ProtectedRoute>
              }
            />

            {/* DASHBOARD */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "student",
                    "general",
                    "campus_student",
                    "admin",
                    "superadmin",
                  ]}
                >
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* CAMPUS (PREDEFINED BATCHES & INSTITUTION LINK) */}
            <Route
              path="/campus"
              element={
                <ProtectedRoute allowedRoles={["student", "campus_student"]}>
                  <Campus />
                </ProtectedRoute>
              }
            />

            {/* PERSONAL ASSESSMENT */}
            <Route
              path="/personal-assessment"
              element={
                <ProtectedRoute
                  allowedRoles={["student", "general", "campus_student"]}
                >
                  <PersonalAssessment />
                </ProtectedRoute>
              }
            />

            {/* ASSESSMENT */}
            <Route
              path="/assessment"
              element={
                <ProtectedRoute
                  allowedRoles={["student", "general", "campus_student"]}
                >
                  <Assessment />
                </ProtectedRoute>
              }
            />

            {/* RESULTS */}
            <Route
              path="/results"
              element={
                <ProtectedRoute
                  allowedRoles={["student", "general", "campus_student"]}
                >
                  <Results />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AppLayout>

        <ToastContainer
          position={toastPosition}
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
