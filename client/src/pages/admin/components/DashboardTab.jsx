import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchAdminStats,
  fetchRecentActivities,
} from "../../../services/adminApi";
import {
  FiUsers,
  FiUserCheck,
  FiUserMinus,
  FiActivity,
  FiServer,
  FiShield,
  FiTerminal,
  FiPlus,
  FiFileText,
  FiPieChart,
  FiBook,
  FiArrowRight,
} from "react-icons/fi";

const DashboardTab = ({ setActiveTab, institution }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    adminName: "",
  });
  const [activities, setActivities] = useState([]);
  const [dbStatus, setDbStatus] = useState("Connecting...");

  const syncDashboard = useCallback(async () => {
    try {
      const [statsData, activityData] = await Promise.all([
        fetchAdminStats(),
        fetchRecentActivities(),
      ]);
      setStats(statsData);
      setActivities(activityData);
      setDbStatus("Connected");
    } catch (err) {
      console.error("Sync error:", err);
      setDbStatus("Disconnected");
    }
  }, []);

  useEffect(() => {
    syncDashboard();
    const interval = setInterval(syncDashboard, 10000);
    return () => clearInterval(interval);
  }, [syncDashboard]);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  // Configuration for quick actions to map over them
  const quickActions = [
    {
      label: "Add Student",
      icon: <FiPlus size={20} />,
      path: "/admin/students",
      color: "from-emerald-400 to-teal-500",
      shadow: "shadow-emerald-500/20",
    },
    {
      label: "Create Assessment",
      icon: <FiFileText size={20} />,
      path: "/admin/assessments",
      color: "from-blue-400 to-indigo-500",
      shadow: "shadow-blue-500/20",
    },
    {
      label: "Reports",
      icon: <FiPieChart size={20} />,
      path: "/admin/reports",
      color: "from-purple-400 to-pink-500",
      shadow: "shadow-purple-500/20",
    },
  ];

  return (
    <div className="w-full space-y-8 pb-10">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in-up delay-[100ms]">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="relative flex h-3 w-3">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dbStatus === "Connected" ? "bg-emerald-400" : "bg-red-400"}`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${dbStatus === "Connected" ? "bg-emerald-500" : "bg-red-500"}`}
              ></span>
            </span>
            <span className="text-sm font-medium text-[#4B5563] dark:text-white/60">
              Database {dbStatus}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-[#1C1E21] dark:text-white tracking-tight">
            {greeting},{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00A8E8] to-[#007EA7]">
              {stats.adminName || "Admin"}
            </span>
          </h1>
        </div>
        <div className="px-5 py-2.5 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-2xl shadow-sm text-sm font-medium text-[#4B5563] dark:text-white/80 w-fit">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      </header>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up delay-[200ms]">
        {quickActions.map((action, idx) => (
          <button
            key={idx}
            onClick={() => navigate(action.path)}
            className={`group flex items-center gap-4 p-5 bg-white dark:bg-[#00171F]/50 border border-black/5 dark:border-white/10 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
          >
            <div
              className={`p-3 rounded-xl bg-gradient-to-br ${action.color} text-white shadow-lg ${action.shadow}`}
            >
              {action.icon}
            </div>
            <span className="font-bold text-[#1C1E21] dark:text-white/90 group-hover:text-[#00A8E8] transition-colors">
              {action.label}
            </span>
          </button>
        ))}
      </div>

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Students */}
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 p-6 md:p-8 rounded-[2rem] shadow-soft animate-fade-in-left delay-[300ms]">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shadow-inner">
              <FiUsers size={28} />
            </div>
            <div>
              <p className="text-sm font-bold text-[#9CA3AF] dark:text-white/50 uppercase tracking-wider">
                Total Students
              </p>
              <h3 className="text-3xl md:text-4xl font-display font-bold text-[#1C1E21] dark:text-white mt-1">
                {stats.totalStudents.toLocaleString()}
              </h3>
            </div>
          </div>
        </div>

        {/* Active Students */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/5 dark:to-teal-500/5 border border-emerald-500/20 dark:border-emerald-500/10 p-6 md:p-8 rounded-[2rem] shadow-soft animate-fade-in-left delay-[450ms]">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <FiUserCheck size={28} />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400/80 uppercase tracking-wider">
                Active Students
              </p>
              <h3 className="text-3xl md:text-4xl font-display font-bold text-emerald-800 dark:text-emerald-400 mt-1">
                {stats.activeStudents.toLocaleString()}
              </h3>
            </div>
          </div>
        </div>

        {/* Inactive Students */}
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 p-6 md:p-8 rounded-[2rem] shadow-soft animate-fade-in-left delay-[600ms]">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center shadow-inner">
              <FiUserMinus size={28} />
            </div>
            <div>
              <p className="text-sm font-bold text-[#9CA3AF] dark:text-white/50 uppercase tracking-wider">
                Inactive
              </p>
              <h3 className="text-3xl md:text-4xl font-display font-bold text-[#1C1E21] dark:text-white mt-1">
                {(stats.totalStudents - stats.activeStudents).toLocaleString()}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Institutions Panel */}
        <div className="bg-white dark:bg-[#00171F]/50 border border-black/5 dark:border-white/10 p-6 md:p-8 rounded-[2rem] shadow-soft animate-fade-in-up delay-[750ms] flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 rounded-xl">
                <FiBook size={22} />
              </div>
              <h2 className="text-xl font-bold text-[#1C1E21] dark:text-white">
                Institutions
              </h2>
            </div>
            {institution && institution.length > 4 && (
              <button
                onClick={() => setActiveTab("institution")}
                className="text-sm font-bold text-[#00A8E8] hover:text-[#007EA7] flex items-center gap-1 transition-colors group"
              >
                See More{" "}
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
            {institution && institution.length > 0 ? (
              institution.slice(0, 4).map((inst) => (
                <div
                  key={inst._id || inst.name}
                  className="flex items-center justify-between p-4 bg-[#F8FAFC] dark:bg-[#00171F]/30 rounded-xl border border-[#007EA7]/10 dark:border-white/5 hover:border-[#00A8E8]/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
                      {inst.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-[#1C1E21] dark:text-white/90 block">
                        {inst.name}
                      </span>
                      <span className="text-xs text-[#9CA3AF] dark:text-white/50 block">
                        {inst.city || "Location unavailable"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab("institution")}
                    className="p-2 text-[#9CA3AF] hover:text-[#00A8E8] transition-colors bg-white/50 dark:bg-white/5 rounded-lg border border-black/5 dark:border-white/10"
                  >
                    <FiArrowRight size={16} />
                  </button>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-[#9CA3AF] dark:text-white/40 space-y-3 py-10">
                <FiBook size={40} className="opacity-20" />
                <p className="text-sm font-medium">No institutions found</p>
                <button
                  onClick={() => setActiveTab("institution")}
                  className="px-4 py-2 mt-2 bg-[#00A8E8]/10 text-[#00A8E8] font-bold rounded-lg text-sm hover:bg-[#00A8E8]/20 transition-colors"
                >
                  Set Up Institution
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="bg-white dark:bg-[#00171F]/50 border border-black/5 dark:border-white/10 p-6 md:p-8 rounded-[2rem] shadow-soft animate-fade-in-up delay-[900ms] flex flex-col h-full lg:max-h-[400px]">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-50 dark:bg-purple-500/10 text-purple-500 rounded-xl relative">
                <FiActivity size={22} />
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border-2 border-white dark:border-[#00171F]"></span>
              </div>
              <h2 className="text-xl font-bold text-[#1C1E21] dark:text-white">
                Live Activity
              </h2>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
            {activities.length > 0 ? (
              activities.map((item) => (
                <div
                  key={item.id || item._id}
                  className="relative pl-6 py-2 before:absolute before:left-[11px] before:top-8 before:bottom-0 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-800 last:before:hidden animate-fade-in"
                >
                  <div className="absolute left-0 top-3 w-6 h-6 bg-white dark:bg-[#00171F] rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center z-10">
                    <div className="w-2 h-2 bg-[#00A8E8] rounded-full"></div>
                  </div>
                  <div className="bg-[#F8FAFC] dark:bg-white/5 p-4 rounded-xl border border-black/5 dark:border-white/5">
                    <p className="text-sm text-[#1C1E21] dark:text-white/90 font-medium leading-snug mb-1">
                      {item.text}
                    </p>
                    <p className="text-xs text-[#9CA3AF] dark:text-white/50 font-medium flex items-center gap-1.5">
                      {new Date(item.time).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-[#9CA3AF] dark:text-white/40 space-y-3 py-10">
                <FiActivity size={40} className="opacity-20" />
                <p className="text-sm font-medium">No recent activity found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;
