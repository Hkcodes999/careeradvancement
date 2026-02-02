import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  FiGrid,
  FiUser,
  FiFileText,
  FiPieChart,
  FiMenu,
  FiX,
} from "react-icons/fi";

const StudentSidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const isAssessmentActive = location.pathname.startsWith("/assessment");

  const toggleSidebar = () => setIsOpen(!isOpen);

  const links = [
    { name: "Dashboard", path: "/dashboard", icon: FiGrid },
    { name: "My Profile", path: "/profile", icon: FiUser },
    {
      name: "Assessment",
      path: "/assessment",
      icon: FiFileText,
      activeCheck: isAssessmentActive,
    },
    { name: "Results", path: "/results", icon: FiPieChart },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md text-primary-dark md:hidden hover:bg-bg-light transition-colors"
      >
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-slate-200 shadow-xl md:shadow-none transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:fixed md:top-[72px] md:h-[calc(100vh-72px)]
      `}
      >
        <div className="h-full flex flex-col p-6">
          <div className="mb-10 pl-2 md:hidden">
            <h2 className="text-xl font-black tracking-tight text-primary-dark">
              MentorPath <span className="text-accent-blue">AI</span>
            </h2>
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
                    flex items-center gap-3 px-4 py-3.5 rounded-xl text-[0.95rem] font-medium transition-all duration-200 group
                    ${
                      isActive
                        ? "bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }
                  `}
                >
                  <link.icon
                    className={`text-lg ${isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}`}
                  />
                  {link.name}
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto px-4 py-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Status
            </p>
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-status-pulse" />
              Connected
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default StudentSidebar;
