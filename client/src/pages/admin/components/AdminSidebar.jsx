import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  FiHome,
  FiBook,
  FiLayers,
  FiUserPlus,
  FiCpu,
  FiLogOut,
  FiMenu,
  FiX,
  FiSun,
  FiMoon,
  FiUsers,
} from "react-icons/fi";
import { toast } from "react-toastify";
import logo from "../../../assets/logo.png";

const AdminSidebar = ({ activeTab, setActiveTab }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: <FiHome size={20} /> },
    { id: "institution", label: "Institution", icon: <FiBook size={20} /> },
    { id: "batch", label: "Batch & Slots", icon: <FiLayers size={20} /> },
    { id: "assign", label: "Assign Students", icon: <FiUserPlus size={20} /> },
    { id: "users", label: "Users", icon: <FiUsers size={20} /> },
    { id: "ai", label: "AI Builder", icon: <FiCpu size={20} /> },
  ];

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setIsDarkMode(isDark);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          setIsDarkMode(document.documentElement.classList.contains("dark"));
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const currentlyDark = document.documentElement.classList.contains("dark");
    if (currentlyDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDarkMode(true);
    }
  };

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    toast.success("Logged out successfully");
    window.location.href = "/admin/login";
  };

  const handleTabClick = (id) => {
    setActiveTab(id);
    setIsMobileOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-3 bg-white dark:bg-[#00171F] text-[#1C1E21] dark:text-white rounded-xl shadow-lg border border-black/5 dark:border-white/10"
      >
        {isMobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-72 bg-white/80 dark:bg-[#00171F]/80 backdrop-blur-2xl border-r border-[#00A8E8]/10 dark:border-white/10 z-40 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} shadow-[4px_0_24px_rgba(0,168,232,0.05)] dark:shadow-none flex flex-col`}
      >
        <div className="p-8">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="MentorPath AI Logo"
              className={`h-10 w-auto object-contain transition-all duration-300 ${isDarkMode ? "brightness-0 invert" : ""}`}
            />
            {/* Redesigned Brand name for consistency with student side */}
            <div className="flex flex-col">
              <span className="font-display font-bold text-xl leading-none text-[#1C1E21] dark:text-white tracking-tight">
                Career <span className="text-[#00A8E8]">Advancement</span>
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {tabs.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full relative flex items-center gap-4 px-4 py-3.5 rounded-2xl font-medium transition-all duration-300 group ${
                  isActive
                    ? "text-white bg-gradient-to-r from-[#00A8E8] to-[#007EA7] shadow-lg shadow-[#00A8E8]/25"
                    : "text-[#4B5563] dark:text-white/60 hover:text-[#00A8E8] dark:hover:text-[#00A8E8] hover:bg-[#00A8E8]/5 dark:hover:bg-[#00A8E8]/10"
                }`}
              >
                <div
                  className={`transition-colors duration-300 ${
                    isActive
                      ? "text-white"
                      : "text-[#9CA3AF] dark:text-white/40 group-hover:text-[#00A8E8]"
                  }`}
                >
                  {item.icon}
                </div>

                <span className="text-[15px]">{item.label}</span>

                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-white dark:bg-[#00A8E8] rounded-r-full shadow-[0_0_10px_rgba(255,255,255,0.5)] dark:shadow-[0_0_10px_rgba(0,168,232,0.5)]" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#00A8E8]/10 dark:border-white/10 space-y-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 shadow-sm hover:bg-white dark:hover:bg-white/10 transition-colors group"
          >
            <div className="flex items-center gap-3 text-[#4B5563] dark:text-white/70 font-medium group-hover:text-[#00A8E8] dark:group-hover:text-white transition-colors">
              {isDarkMode ? <FiMoon size={18} /> : <FiSun size={18} />}
              <span className="text-[15px]">
                {isDarkMode ? "Dark Mode" : "Light Mode"}
              </span>
            </div>
            <div
              className={`w-10 h-5 rounded-full relative transition-colors ${
                isDarkMode ? "bg-[#00A8E8]" : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <div
                className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                  isDarkMode ? "left-[calc(100%-18px)]" : "left-[2px]"
                }`}
              ></div>
            </div>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-[#EF4444] hover:bg-[#EF4444]/10 dark:hover:bg-[#EF4444]/10 rounded-2xl transition-colors font-medium group"
          >
            <FiLogOut
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span className="text-[15px]">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
