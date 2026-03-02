import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Context Provider
import { AuthProvider } from "./context/AuthContext";

// Components
import Navbar from "./components/Navbar";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import SmoothScroll from "./components/SmoothScroll";
import GlobalLoader from "./components/GlobalLoader";

// Pages
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
import StudentResultsHistory from "./pages/student/StudentResultsHistory";

/* ---------------- Layout Components ---------------- */

// 1. Main Layout: For public pages with Navbar
const MainLayout = () => {
  return (
    <SmoothScroll>
      <Navbar />
      <Layout>
        <Outlet />
      </Layout>
    </SmoothScroll>
  );
};

// 2. Auth Layout: For Login/Signup pages without Navbar
const AuthLayout = () => {
  return (
    <SmoothScroll>
      <Outlet />
    </SmoothScroll>
  );
};

// 3. Protected Layout: For all authenticated routes. Wraps ProtectedRoute.
const ProtectedLayout = ({ allowedRoles }) => {
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <SmoothScroll>
        <Layout>
          <Outlet />
        </Layout>
      </SmoothScroll>
    </ProtectedRoute>
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
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ================= PUBLIC MAIN ROUTES ================= */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route
              path="/join-campus/:institutionId"
              element={<JoinCampus />}
            />
          </Route>

          {/* ================= AUTH ROUTES ================= */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>

          {/* ================= PROTECTED ROUTES ================= */}

          {/* STUDENT / GENERAL / CAMPUS_STUDENT */}
          <Route
            element={
              <ProtectedLayout
                allowedRoles={["student", "general", "campus_student"]}
              />
            }
          >
            <Route path="/profile" element={<StudentProfile />} />
            <Route
              path="/personal-assessment"
              element={<PersonalAssessment />}
            />
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/results" element={<StudentResultsHistory />} />
          </Route>

          {/* RESULTS VIEW - AUTHENTICATED USERS (Students & Admins) */}
          <Route
            element={
              <ProtectedLayout
                allowedRoles={[
                  "student",
                  "general",
                  "campus_student",
                  "admin",
                  "superadmin",
                ]}
              />
            }
          >
            <Route path="/results/:id" element={<Results />} />
          </Route>

          {/* DASHBOARD - ALL ROLES */}
          <Route
            element={
              <ProtectedLayout
                allowedRoles={[
                  "student",
                  "general",
                  "campus_student",
                  "admin",
                  "superadmin",
                ]}
              />
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          {/* CAMPUS PAGES - CAMPUS_STUDENT ONLY */}
          <Route
            element={
              <ProtectedLayout allowedRoles={["student", "campus_student"]} />
            }
          >
            <Route path="/campus" element={<Campus />} />
          </Route>
        </Routes>

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
