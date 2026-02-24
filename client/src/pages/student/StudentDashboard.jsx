import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import StudentSidebar from "../../components/StudentSidebar";
import { fetchStudentBatchStatus } from "../../services/studentApi";
import { toast } from "react-toastify";
import {
  FiUser,
  FiCommand,
  FiMapPin,
  FiPieChart,
  FiArrowRight,
  FiAlertCircle,
  FiTrendingUp,
  FiTarget,
  FiAward,
} from "react-icons/fi";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [userName, setUserName] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const res = await fetchStudentBatchStatus();
      setStatus(res);
      if (res.userName) setUserName(res.userName);
    } catch (err) {
      toast.error("Dashboard Sync Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen bg-surface dark:bg-[#00171F] flex items-center justify-center transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-[#007EA7]/30 dark:border-white/10 border-t-[#00A8E8] dark:border-t-white rounded-full animate-spin"></div>
          <p className="text-[#4B5563] dark:text-white/60 font-bold animate-pulse">
            Syncing Profile Data...
          </p>
        </div>
      </div>
    );

  const quickActions = [
    {
      title: "Personal Assessment",
      desc: "Generate an AI-tailored assessment on any topic instantly.",
      icon: <FiCommand size={24} />,
      path: "/personal-assessment",
      color: "from-purple-500 to-indigo-600",
      visible: true,
    },
    {
      title: "Campus Training",
      desc: "Connect to your institution and complete assigned paths.",
      icon: <FiMapPin size={24} />,
      path: "/campus",
      color: "from-[#00A8E8] to-[#007EA7]",
      visible: ["campus_student", "student"].includes(user?.role), // Only show if they have campus role logically
    },
    {
      title: "Update Profile",
      desc: "Keep your skills and academic records up to date.",
      icon: <FiUser size={24} />,
      path: "/profile",
      color: "from-orange-400 to-amber-500",
      visible: true,
    },
    {
      title: "Global Results",
      desc: "See how you compare against peers worldwide.",
      icon: <FiPieChart size={24} />,
      path: "/results",
      color: "from-emerald-400 to-teal-500",
      visible: true,
    },
  ];

  return (
    <div className="relative flex min-h-screen bg-surface dark:bg-[#00171F] font-sans overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#00A8E8]/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-50 dark:opacity-100"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#007EA7]/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-50 dark:opacity-100"></div>
        <div className="absolute top-[40%] left-[60%] w-[400px] h-[400px] bg-[#00A8E8]/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen opacity-50 dark:opacity-100"></div>

        <div className="absolute inset-0 z-0 overflow-hidden opacity-20 hidden md:block">
          <svg
            className="absolute w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="dashboard-grid"
                w="40"
                h="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-black/[0.1] dark:text-white/20"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dashboard-grid)" />
          </svg>
        </div>
      </div>

      <div className="relative z-10 flex w-full">
        <StudentSidebar />
        <main className="flex-1 p-6 md:p-10 md:ml-72 max-w-7xl mx-auto w-full pt-[40px] md:pt-10">
          {/* Header section */}
          <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="animate-fade-in-up">
              <h1 className="text-2xl md:text-4xl font-display font-black text-[#1C1E21] dark:text-white tracking-tight mb-2 drop-shadow-sm">
                Dashboard Overview
              </h1>
              <p className="text-sm text-[#4B5563] dark:text-white/60 font-medium">
                Your career advancement command center.
              </p>
            </div>

            <div className="flex items-center gap-5 bg-white/90 dark:bg-[#00171F]/80 backdrop-blur-xl px-4 py-4 rounded-3xl border border-black/5 dark:border-white/10 shadow-soft-xl relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00A8E8] to-[#007EA7] flex items-center justify-center text-white font-bold text-xl shadow-inner ring-4 ring-primary/10 dark:ring-white/5 capitalize">
                {userName?.charAt(0) || "U"}
              </div>
              <div className="pr-2">
                <p className="text-xs text-[#4B5563] dark:text-white/50 font-bold uppercase tracking-widest mb-1">
                  Welcome back
                </p>
                <p className="text-base font-display font-bold text-[#1C1E21] dark:text-white leading-none capitalize">
                  {userName}
                </p>
              </div>
            </div>
          </div>

          {!status?.profileComplete && (
            <div className="mb-10 bg-gradient-to-br from-orange-400 to-amber-500 dark:from-amber-600 dark:to-orange-700 rounded-[2rem] p-6 lg:p-8 flex flex-col md:flex-row items-center gap-6 shadow-xl shadow-orange-500/20 dark:shadow-none transition-transform hover:scale-[1.01]">
              <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl text-white shadow-inner">
                <FiAlertCircle size={36} strokeWidth={2.5} />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-display font-black text-white mb-2">
                  Complete Your Profile
                </h3>
                <p className="text-white/90 text-sm max-w-2xl leading-relaxed font-medium">
                  Unlock AI tailored career paths and assessments by providing a
                  few more details about your education.
                </p>
              </div>
              <button
                onClick={() => navigate("/profile")}
                className="px-6 py-3 bg-white text-orange-600 font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2"
              >
                Set Up Profile <FiArrowRight />
              </button>
            </div>
          )}

          {/* KPI Stats Row Placeholder */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 p-6 rounded-3xl shadow-soft">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center">
                  <FiTarget size={24} />
                </div>
                <h4 className="text-sm font-bold text-[#4B5563] dark:text-white/60 uppercase tracking-wider">
                  Target Domain
                </h4>
              </div>
              <p className="text-2xl font-black text-[#1C1E21] dark:text-white leading-none">
                {status?.stream ||
                  status?.shortTermGoal ||
                  status?.longTermGoal ||
                  status?.profileStream ||
                  "Not Set"}
              </p>
              {!status?.stream && status?.shortTermGoal && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold tracking-wide uppercase mt-2 block">
                  Short-Term Goal
                </span>
              )}
              {!status?.stream &&
                !status?.shortTermGoal &&
                status?.longTermGoal && (
                  <span className="text-xs text-purple-600 dark:text-purple-400 font-bold tracking-wide uppercase mt-2 block">
                    Long-Term Goal
                  </span>
                )}
            </div>

            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 p-6 rounded-3xl shadow-soft">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
                  <FiTrendingUp size={24} />
                </div>
                <h4 className="text-sm font-bold text-[#4B5563] dark:text-white/60 uppercase tracking-wider">
                  Assessments
                </h4>
              </div>
              <p className="text-2xl font-black text-[#1C1E21] dark:text-white">
                {status?.assessmentsCompleted || 0}{" "}
                <span className="text-sm text-[#4B5563] dark:text-white/50 font-medium normal-case">
                  Completed
                </span>
              </p>
            </div>

            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 p-6 rounded-3xl shadow-soft">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-[#00A8E8]/10 text-[#00A8E8] dark:text-[#00A8E8] rounded-2xl flex items-center justify-center">
                  <FiAward size={24} />
                </div>
                <h4 className="text-sm font-bold text-[#4B5563] dark:text-white/60 uppercase tracking-wider">
                  Avg. Score
                </h4>
              </div>
              <p className="text-2xl font-black text-[#1C1E21] dark:text-white">
                {status?.avgScore || "--"}{" "}
                <span className="text-sm text-[#4B5563] dark:text-white/50 font-medium normal-case">
                  / 100
                </span>
              </p>
            </div>
          </div>

          <h2 className="text-xl font-display font-black text-[#1C1E21] dark:text-white mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions
              .filter((action) => action.visible)
              .map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(action.path)}
                  className="group relative flex flex-col p-6 bg-white dark:bg-[#00171F]/50 border border-black/5 dark:border-white/10 rounded-[2rem] shadow-soft hover:shadow-soft-xl transition-all duration-300 hover:-translate-y-1 text-left overflow-hidden"
                >
                  <div
                    className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${action.color} opacity-10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110 pointer-events-none`}
                  ></div>

                  <div
                    className={`w-14 h-14 bg-gradient-to-br ${action.color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    {action.icon}
                  </div>

                  <h3 className="text-lg font-bold text-[#1C1E21] dark:text-white mb-2 line-clamp-1">
                    {action.title}
                  </h3>
                  <p className="text-sm text-[#4B5563] dark:text-white/60 font-medium line-clamp-2">
                    {action.desc}
                  </p>

                  <div className="mt-6 flex items-center text-sm font-bold text-[#00A8E8]">
                    Start{" "}
                    <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
