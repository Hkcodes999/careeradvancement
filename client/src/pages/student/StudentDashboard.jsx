import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import StudentSidebar from "../../components/StudentSidebar";
import {
  fetchStudentBatchStatus,
  setAssessmentGoal,
} from "../../services/studentApi";
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
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiMessageSquare,
  FiPlus,
  FiX,
} from "react-icons/fi";
import GlobalLoader from "../../components/GlobalLoader";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [userName, setUserName] = useState("");

  // Goal Modal State
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoalType, setEditingGoalType] = useState(null); // 'shortTermGoal' | 'longTermGoal'
  const [selectedDomain, setSelectedDomain] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [savingGoal, setSavingGoal] = useState(false);

  const [expandedCategory, setExpandedCategory] = useState("Technical");

  const categorizedDomains = {
    Technical: [
      "Software Engineering",
      "Data Science",
      "Cybersecurity",
      "Cloud Computing",
      "UI/UX Design",
    ],
    Medical: [
      "Medical Sciences",
      "Healthcare Administration",
      "Nursing",
      "Biotechnology",
    ],
    Business: [
      "Financial Analysis",
      "Product Management",
      "Digital Marketing",
      "Sales & Operations",
    ],
  };

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

  const openGoalModal = (type) => {
    setEditingGoalType(type);
    setSelectedDomain("");
    setCustomDomain("");
    setIsGoalModalOpen(true);
  };

  const handleSaveGoal = async () => {
    const finalDomain = customDomain.trim() || selectedDomain;
    if (!finalDomain) {
      toast.error("Please select or enter a goal domain.");
      return;
    }

    try {
      setSavingGoal(true);
      const res = await setAssessmentGoal(finalDomain, editingGoalType);

      if (res.success) {
        toast.success(res.message || "Goal updated successfully!");
        // Update local state to reflect UI changes immediately
        setStatus((prev) => ({
          ...prev,
          profile: {
            ...prev.profile,
            [editingGoalType]: finalDomain,
          },
        }));
        setIsGoalModalOpen(false);
      }
    } catch (error) {
      toast.error(error.message || "Failed to save goal.");
    } finally {
      setSavingGoal(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) return <GlobalLoader />;

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
            <div className="mb-10 bg-gradient-to-br from-orange-400 to-amber-500 dark:from-amber-600 dark:to-orange-700 rounded-[2rem] p-6 lg:p-8 flex flex-col md:flex-row items-center gap-6 shadow-xl shadow-orange-500/20 dark:shadow-none transition-transform hover:scale-[1.01] animate-fade-in-left delay-[150ms]">
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
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 p-6 rounded-3xl shadow-soft animate-fade-in-left delay-[300ms]">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center">
                  <FiTarget size={24} />
                </div>
                <h4 className="text-sm font-bold text-[#4B5563] dark:text-white/60 uppercase tracking-wider">
                  Target Domain
                </h4>
              </div>
              <div className="space-y-4">
                {status?.shortTermGoal && (
                  <div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold tracking-widest uppercase mb-1 block">
                      Short-Term Goal
                    </span>
                    <p className="text-xl font-black text-[#1C1E21] dark:text-white leading-tight">
                      {status.shortTermGoal}
                    </p>
                  </div>
                )}
                {status?.longTermGoal && (
                  <div>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold tracking-widest uppercase mb-1 block">
                      Long-Term Goal
                    </span>
                    <p className="text-xl font-black text-[#1C1E21] dark:text-white leading-tight">
                      {status.longTermGoal}
                    </p>
                  </div>
                )}
                {!status?.stream &&
                  !status?.profileStream &&
                  !status?.shortTermGoal &&
                  !status?.longTermGoal && (
                    <p className="text-2xl font-black text-[#1C1E21] dark:text-white leading-none">
                      Not Set
                    </p>
                  )}
              </div>
            </div>

            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 p-6 rounded-3xl shadow-soft animate-fade-in-left delay-[450ms]">
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

            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 p-6 rounded-3xl shadow-soft animate-fade-in-left delay-[600ms]">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Left Column: Goals & Tips */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              {/* Career Goals Block */}
              <div className="bg-white dark:bg-[#00171F]/50 border border-black/5 dark:border-white/10 p-6 md:p-8 rounded-[2rem] shadow-soft flex-1 animate-fade-in-left delay-[750ms]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 rounded-xl">
                    <FiBriefcase size={22} />
                  </div>
                  <h3 className="text-xl font-display font-black text-[#1C1E21] dark:text-white">
                    Career Goals
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-[#F8FAFC] dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5">
                    <span className="text-xs font-bold text-[#4B5563] dark:text-white/50 uppercase tracking-widest block mb-1">
                      Target Domain (Dream Role)
                    </span>
                    <p className="text-[#1C1E21] dark:text-white/90 font-medium">
                      {status?.profile?.careerGoal || "Not specified yet."}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => openGoalModal("shortTermGoal")}
                      className="p-4 bg-[#F8FAFC] dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 hover:border-[#00A8E8]/50 transition-colors text-left group relative md:h-[90px]"
                    >
                      <span className="text-xs font-bold text-[#4B5563] dark:text-white/50 uppercase tracking-widest block mb-1">
                        Short-Term Goal
                      </span>
                      {status?.profile?.shortTermGoal ? (
                        <p className="text-[#1C1E21] dark:text-white/90 font-medium">
                          {status.profile.shortTermGoal}
                        </p>
                      ) : (
                        <div className="flex items-center gap-2 text-[#00A8E8] font-bold mt-1">
                          <div className="w-6 h-6 rounded-full bg-[#00A8E8]/10 flex items-center justify-center">
                            <FiPlus />
                          </div>
                          Add Goal
                        </div>
                      )}
                    </button>

                    <button
                      onClick={() => openGoalModal("longTermGoal")}
                      className="p-4 bg-[#F8FAFC] dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 hover:border-[#00A8E8]/50 transition-colors text-left group relative md:h-[90px]"
                    >
                      <span className="text-xs font-bold text-[#4B5563] dark:text-white/50 uppercase tracking-widest block mb-1">
                        Long-Term Goal
                      </span>
                      {status?.profile?.longTermGoal ? (
                        <p className="text-[#1C1E21] dark:text-white/90 font-medium">
                          {status.profile.longTermGoal}
                        </p>
                      ) : (
                        <div className="flex items-center gap-2 text-[#00A8E8] font-bold mt-1">
                          <div className="w-6 h-6 rounded-full bg-[#00A8E8]/10 flex items-center justify-center">
                            <FiPlus />
                          </div>
                          Add Goal
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* AI Improvement Tips Block */}
              <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/5 dark:to-purple-500/5 border border-indigo-500/20 dark:border-indigo-500/10 p-6 md:p-8 rounded-[2rem] shadow-soft animate-fade-in-left delay-[900ms]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-indigo-500 text-white rounded-xl shadow-md">
                    <FiMessageSquare size={22} />
                  </div>
                  <h3 className="text-xl font-display font-black text-[#1C1E21] dark:text-white">
                    AI Improvement Nudge
                  </h3>
                </div>
                <div className="p-5 bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-2xl border border-white/50 dark:border-white/10 shadow-inner">
                  {status?.recentResults?.length > 0 &&
                  status.recentResults[0].improvementSuggestions?.length > 0 ? (
                    <ul className="space-y-3">
                      {status.recentResults[0].improvementSuggestions
                        .slice(0, 3)
                        .map((tip, i) => (
                          <li
                            key={i}
                            className="flex gap-3 text-sm md:text-base text-[#1C1E21] dark:text-white/80 leading-relaxed font-medium"
                          >
                            <FiCheckCircle className="text-emerald-500 mt-1 flex-shrink-0" />
                            <span>{tip}</span>
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <p className="text-sm md:text-base text-[#4B5563] dark:text-white/70 leading-relaxed font-medium">
                      Based on your profile, we recommend taking a{" "}
                      <strong className="text-indigo-600 dark:text-indigo-400">
                        Personal Assessment
                      </strong>{" "}
                      to evaluate your baseline skills in{" "}
                      <span className="italic">
                        {status?.stream || "your target domain"}
                      </span>
                      . Once completed, our AI will generate targeted feedback
                      here to accelerate your career growth.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Recent Assessments Widget */}
            <div className="flex flex-col gap-6">
              <div className="bg-white dark:bg-[#00171F]/50 border border-black/5 dark:border-white/10 p-6 rounded-[2rem] shadow-soft flex flex-col h-fit animate-fade-in-left delay-[1050ms]">
                <div className="flex items-center justify-between gap-3 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-xl">
                      <FiTrendingUp size={22} />
                    </div>
                    <h3 className="text-xl font-display font-black text-[#1C1E21] dark:text-white">
                      Recent Tests
                    </h3>
                  </div>
                </div>

                <div className="flex flex-col gap-4 flex-1">
                  {status?.recentResults?.length > 0 ? (
                    status.recentResults.map((result, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-[#F8FAFC] dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 group hover:border-[#00A8E8]/30 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-bold text-[#1C1E21] dark:text-white line-clamp-1 pr-2">
                            {result.targetDomain || "General Test"}
                          </span>
                          <span
                            className={`text-sm font-black flex-shrink-0 ${
                              result.overallPercentage >= 80
                                ? "text-emerald-500"
                                : result.overallPercentage >= 60
                                  ? "text-orange-500"
                                  : "text-red-500"
                            }`}
                          >
                            {result.overallPercentage}%
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-[#4B5563] dark:text-white/50 font-medium">
                          <FiCalendar />
                          {new Date(result.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-[#F8FAFC] dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 border-dashed">
                      <p className="text-sm text-[#4B5563] dark:text-white/50 font-medium mb-1">
                        No recent tests found.
                      </p>
                      <p className="text-xs text-[#9CA3AF] dark:text-white/40">
                        Take an assessment to see your history here.
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => navigate("/results")}
                  className="mt-6 w-full py-3.5 bg-gray-900 dark:bg-white text-white dark:text-[#000E14] font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                >
                  View All Results <FiArrowRight />
                </button>
              </div>
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
                  className="group relative flex flex-col p-6 bg-white dark:bg-[#00171F]/50 border border-black/5 dark:border-white/10 rounded-[2rem] shadow-soft hover:shadow-soft-xl transition-all duration-300 hover:-translate-y-1 text-left overflow-hidden animate-fade-in-left"
                  style={{ animationDelay: `${1200 + idx * 150}ms` }}
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

      {/* Goal Setting Modal */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-black/40">
          <div
            className="absolute inset-0"
            onClick={() => !savingGoal && setIsGoalModalOpen(false)}
          ></div>
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#00171F] rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up border border-black/5 dark:border-white/10">
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-display font-black text-[#1C1E21] dark:text-white">
                    Set{" "}
                    {editingGoalType === "shortTermGoal"
                      ? "Short-Term"
                      : "Long-Term"}{" "}
                    Goal
                  </h2>
                  <p className="text-sm text-[#4B5563] dark:text-white/60 mt-1">
                    Select a predefined domain or write your own.
                  </p>
                </div>
                <button
                  onClick={() => setIsGoalModalOpen(false)}
                  disabled={savingGoal}
                  className="p-2 bg-black/5 dark:bg-white/10 rounded-full hover:bg-black/10 dark:hover:bg-white/20 transition-colors text-[#1C1E21] dark:text-white"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="mb-8">
                <div className="mb-6 space-y-3">
                  {Object.entries(categorizedDomains).map(
                    ([category, domains]) => (
                      <div
                        key={category}
                        className="border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden bg-[#F8FAFC] dark:bg-white/5"
                      >
                        <button
                          onClick={() =>
                            setExpandedCategory(
                              expandedCategory === category ? null : category,
                            )
                          }
                          className="w-full flex items-center justify-between p-4 bg-white/50 dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        >
                          <span className="font-bold text-[#1C1E21] dark:text-white">
                            {category} Fields
                          </span>
                          <FiTarget
                            className={`transition-transform ${
                              expandedCategory === category
                                ? "rotate-90 text-[#00A8E8]"
                                : "text-[#4B5563] dark:text-white/50"
                            }`}
                          />
                        </button>

                        {expandedCategory === category && (
                          <div className="p-4 flex flex-wrap gap-2 border-t border-black/5 dark:border-white/5 bg-white/30 dark:bg-transparent">
                            {domains.map((domain, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  setSelectedDomain(domain);
                                  setCustomDomain("");
                                }}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                                  selectedDomain === domain && !customDomain
                                    ? "bg-[#00A8E8] text-white border-[#00A8E8] shadow-md"
                                    : "bg-white dark:bg-black/20 text-[#1C1E21] dark:text-white/80 border-black/10 dark:border-white/10 hover:border-[#00A8E8] hover:text-[#00A8E8]"
                                }`}
                              >
                                {domain}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ),
                  )}
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiTarget className="text-[#4B5563] dark:text-white/40" />
                  </div>
                  <input
                    type="text"
                    placeholder="Or type a custom domain (e.g., DevOps, Game Design)..."
                    value={customDomain}
                    onChange={(e) => {
                      setCustomDomain(e.target.value);
                      if (e.target.value) setSelectedDomain("");
                    }}
                    className="w-full pl-11 pr-4 py-3 bg-[#F8FAFC] dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-[#1C1E21] dark:text-white placeholder:text-[#4B5563] dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#007EA7] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsGoalModalOpen(false)}
                  disabled={savingGoal}
                  className="px-6 py-2.5 rounded-xl text-[#4B5563] dark:text-white/70 font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveGoal}
                  disabled={
                    savingGoal || (!selectedDomain && !customDomain.trim())
                  }
                  className="px-6 py-2.5 bg-gradient-to-r from-[#00A8E8] to-[#007EA7] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {savingGoal ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    "Save Goal"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
