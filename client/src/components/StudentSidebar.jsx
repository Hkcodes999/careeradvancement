import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  FiGrid,
  FiUser,
  FiFileText,
  FiPieChart,
  FiMenu,
  FiX,
  FiLogOut,
  FiCommand,
  FiSun,
  FiMoon,
  FiMapPin,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";
import { useEffect } from "react";

const StudentSidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const isAssessmentActive = location.pathname.startsWith("/assessment");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const toggleSidebar = () => setIsOpen(!isOpen);

  const ObjectLinks = [
    { name: "Dashboard", path: "/dashboard", icon: FiGrid, visible: true },
    {
      name: "My Campus",
      path: "/campus",
      icon: FiMapPin,
      visible: ["campus_student", "student"].includes(user?.role),
    },
    {
      name: "Personal Assessment",
      path: "/personal-assessment",
      icon: FiCommand,
      visible: true,
    },
    { name: "My Profile", path: "/profile", icon: FiUser, visible: true },
    {
      name: "Assessment",
      path: "/assessment",
      icon: FiFileText,
      activeCheck: isAssessmentActive,
      visible: true,
    },
    {
      name: "Global Results",
      path: "/results",
      icon: FiPieChart,
      visible: true,
    },
  ];

  const links = ObjectLinks.filter((link) => link.visible !== false);

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`
        fixed top-0 left-0 z-40 h-screen w-72 bg-white/60 dark:bg-[#00171F]/80 backdrop-blur-xl border-r border-black/5 dark:border-white/10 shadow-soft-2xl md:shadow-none transition-transform duration-300 ease-spring
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:fixed
      `}
      >
        <div className="h-full flex flex-col p-6">
          <div className="mb-8 pl-1">
            <Link
              to="/"
              className="flex items-center gap-3 group"
              onClick={() => setIsOpen(false)}
            >
              <div className="relative flex items-center justify-center w-fit h-full group-hover:scale-105 transition-transform bg-white rounded-xl shadow-sm border border-black/5 dark:border-white/10 p-1.5">
                <img
                  src={logo}
                  alt="Logo"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-xl leading-none text-[#1C1E21] dark:text-white tracking-tight">
                  Career <span className="text-[#00A8E8]">Advancement</span>
                </span>
              </div>
            </Link>
          </div>

          <nav className="flex flex-col gap-2 flex-1">
            {links.map((link) => {
              const isActive =
                link.activeCheck !== undefined
                  ? link.activeCheck
                  : location.pathname === link.path;

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-[0.95rem] font-bold transition-all duration-300 group relative overflow-hidden
                    ${
                      isActive
                        ? "bg-primary text-white shadow-lg shadow-primary/25 translate-x-1"
                        : "text-text-muted dark:text-white/60 hover:bg-white dark:hover:bg-white/5 hover:text-primary dark:hover:text-white hover:shadow-sm"
                    }
                  `}
                >
                  <link.icon
                    className={`text-lg relative z-10 transition-colors ${isActive ? "text-white" : "text-text-light dark:text-white/50 group-hover:text-primary dark:group-hover:text-white"}`}
                  />
                  <span className="relative z-10">{link.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 shadow-sm hover:bg-white dark:hover:bg-white/10 transition-colors group"
            >
              <div className="flex items-center gap-3 text-text-muted dark:text-white/70 font-bold group-hover:text-primary dark:group-hover:text-white transition-colors">
                {theme === "dark" ? <FiMoon size={18} /> : <FiSun size={18} />}
                <span>{theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
              </div>
              <div
                className={`w-10 h-5 rounded-full relative transition-colors ${
                  theme === "dark"
                    ? "bg-primary"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <div
                  className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                    theme === "dark" ? "left-[calc(100%-18px)]" : "left-[2px]"
                  }`}
                ></div>
              </div>
            </button>

            {/* Logout (Mobile Only) */}
            <button
              onClick={logout}
              className="w-full flex md:hidden items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-2xl font-bold transition-colors"
            >
              <FiLogOut /> Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
export default StudentSidebar;
