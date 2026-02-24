import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { joinCampus } from "../../services/studentApi";
import { useAuth } from "../../context/AuthContext";
import { FiLoader, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

const JoinCampus = () => {
  const { institutionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login } = useAuth();

  const [status, setStatus] = useState("loading"); // loading, success, error

  useEffect(() => {
    const handleJoin = async () => {
      // 1. If not logged in, redirect to login, but save this URL so they come back after auth
      if (!user || user.role === null) {
        // You could pass the return URL in state
        navigate("/login", { state: { returnTo: location.pathname } });
        return;
      }

      // 2. Actually perform the join
      try {
        const res = await joinCampus(institutionId);
        if (res.success) {
          setStatus("success");

          // Optionally update global auth context to reflect new role immediately
          if (user.role !== "campus_student") {
            login({ ...user, role: "campus_student" });
          }

          setTimeout(() => {
            navigate("/dashboard");
          }, 2000);
        } else {
          setStatus("error");
        }
      } catch (err) {
        console.error("Failed to join campus via QR", err);
        setStatus("error");
      }
    };

    handleJoin();
  }, [institutionId, user, navigate, location.pathname, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full text-center">
        {status === "loading" && (
          <div className="flex flex-col items-center">
            <FiLoader className="animate-spin text-[#00A8E8] mb-4" size={48} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Connecting to Campus...
            </h2>
            <p className="text-gray-500">
              Please wait while we set up your dashboard.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center animate-fade-in">
            <FiCheckCircle className="text-green-500 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
            <p className="text-gray-500">
              You are now joined to the campus. Redirecting you to your
              dashboard...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center animate-fade-in">
            <FiAlertCircle className="text-red-500 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Connection Failed
            </h2>
            <p className="text-gray-500 mb-6">
              We couldn't connect you to this campus. The link might be invalid
              or expired.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 bg-[#00A8E8] text-white font-bold rounded-xl w-full"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinCampus;
