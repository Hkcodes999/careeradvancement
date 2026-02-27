import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { joinCampus } from "../../services/studentApi";
import { getPublicInstitution } from "../../services/institutionApi";
import { useAuth } from "../../context/AuthContext";
import {
  FiLoader,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowRight,
  FiX,
} from "react-icons/fi";

const JoinCampus = () => {
  const { institutionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login } = useAuth();

  const [status, setStatus] = useState("init"); // init, confirming, joining, success, error
  const [instName, setInstName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const batchId = new URLSearchParams(location.search).get("batch");

  useEffect(() => {
    // 1. Unauthenticated users are sent to login
    if (!user || user.role === null) {
      navigate("/login", {
        state: { returnTo: location.pathname + location.search },
        replace: true,
      });
      return;
    }

    // 2. Fetch public institution name for the confirmation prompt
    const fetchInst = async () => {
      try {
        const res = await getPublicInstitution(institutionId);
        if (res.institution) setInstName(res.institution.name);
        setStatus("confirming");
      } catch (err) {
        console.error("Failed to fetch institution info", err);
        setErrorMessage(
          "We couldn't connect you to this campus. The link might be invalid or expired.",
        );
        setStatus("error");
      }
    };

    if (status === "init") {
      fetchInst();
    }
  }, [
    user,
    navigate,
    location.pathname,
    location.search,
    institutionId,
    status,
  ]);

  const handleJoin = async () => {
    setStatus("joining");
    try {
      const res = await joinCampus(institutionId, batchId);
      if (res.success) {
        setStatus("success");
        // Update global auth context immediately
        if (user.role !== "campus_student") {
          login({ ...user, role: "campus_student" });
        }
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        setErrorMessage(res.message || "Failed to join campus.");
        setStatus("error");
      }
    } catch (err) {
      console.error("Failed to join campus", err);
      setErrorMessage("An unexpected error occurred while joining the campus.");
      setStatus("error");
    }
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  if (status === "init") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <FiLoader className="animate-spin text-[#00A8E8]" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8FAFC]">
      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-md w-full text-center relative overflow-hidden animate-fade-in-up">
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#00A8E8]/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#00A8E8]/5 rounded-full blur-2xl pointer-events-none"></div>

        {status === "confirming" && (
          <div className="flex flex-col items-center relative z-10">
            <div className="w-16 h-16 bg-[#F1F5F9] rounded-2xl flex items-center justify-center mb-5 text-[#00A8E8]">
              <FiCheckCircle size={32} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 tracking-tight">
              Join Campus
            </h2>
            <p className="text-gray-500 mb-8 leading-relaxed px-2">
              You've been invited to join{" "}
              <strong className="text-gray-800 font-semibold">
                {instName || "this institution"}
              </strong>{" "}
              as a Campus Student. Do you want to proceed?
            </p>
            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={handleJoin}
                className="w-full py-3.5 bg-gradient-to-b from-[#00A8E8] to-[#007EA7] text-white font-bold rounded-xl shadow-[0_4px_12px_rgba(0,168,232,0.25)] hover:shadow-[0_6px_16px_rgba(0,168,232,0.35)] hover:-translate-y-[1px] transition-all flex items-center justify-center gap-2"
              >
                Yes, Join Campus <FiArrowRight size={18} />
              </button>
              <button
                onClick={handleCancel}
                className="w-full py-3.5 bg-white text-gray-600 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-all flex items-center justify-center gap-2"
              >
                <FiX size={18} /> Cancel
              </button>
            </div>
          </div>
        )}

        {status === "joining" && (
          <div className="flex flex-col items-center">
            <FiLoader className="animate-spin text-[#00A8E8] mb-5" size={48} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">
              Connecting...
            </h2>
            <p className="text-gray-500">
              Please wait while we set up your campus access.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center animate-fade-in">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-5 text-green-500">
              <FiCheckCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">
              Success!
            </h2>
            <p className="text-gray-500 mb-2">
              You are now enrolled in{" "}
              <span className="font-semibold">{instName}</span>.
            </p>
            <p className="text-sm text-gray-400">
              Redirecting to your dashboard...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center animate-fade-in relative z-10">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-5 text-red-500">
              <FiAlertCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">
              Connection Failed
            </h2>
            <p className="text-gray-500 mb-8 px-2">{errorMessage}</p>
            <button
              onClick={handleCancel}
              className="px-6 py-3.5 bg-[#00A8E8] hover:bg-[#007EA7] text-white font-bold rounded-xl w-full transition-all shadow-md hover:shadow-lg"
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
