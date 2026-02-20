import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FiLogOut,
  FiMenu,
  FiX,
  FiShield,
  FiHome,
  FiClipboard,
  FiUser,
  FiPieChart,
  FiSun,
  FiMoon,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  const closeMenu = () => setIsMobileMenuOpen(false);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    closeMenu();
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate("/login");
    closeMenu();
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b ${
        scrolled
          ? "h-16 bg-[#FFFFFF]/90 dark:bg-[#FFFFFF] dark:bg-[#00171F]/80 backdrop-blur-lg border-black/[0.05] dark:border-white/5 shadow-soft-xl"
          : "h-20 bg-transparent border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex justify-between items-center">
        {/* Logo Section */}
        <Link
          to="/"
          onClick={closeMenu}
          className="flex items-center gap-3 group"
        >
          <div className="relative flex items-center justify-center w-10 h-10 bg-[#00171F] dark:bg-white rounded-lg shadow-lg group-hover:scale-105 transition-transform">
            <span className="text-[#00A8E8] font-extrabold text-xl">C</span>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-2xl leading-none text-[#00171F] dark:text-white tracking-tight">
              Career <span className="text-[#00A8E8]">Advancement</span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation - Centered */}
        <div className="hidden md:flex flex-1 justify-center">
          <div className="flex items-center gap-8 bg-black/[0.05] dark:bg-[#00171F] dark:bg-white/10 px-8 py-2.5 rounded-full backdrop-blur-md border border-black/[0.08] dark:border-white/10 shadow-lg">
            {!user ? (
              <div className="flex items-center gap-6">
                <Link
                  to="/"
                  className={`text-sm font-bold transition-colors hover:text-[#00171F] dark:text-white ${
                    isActive("/")
                      ? "text-[#00171F] dark:text-white"
                      : "text-[#00171F] dark:text-white/70"
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/login"
                  className="bg-[#00171F] dark:bg-white text-[#00A8E8] hover:bg-light hover:text-[#00A8E8]-hover font-bold py-2 px-5 rounded-full shadow-md transition-all hover:shadow-lg text-sm"
                >
                  Sign In
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-2 text-sm font-bold transition-colors hover:text-[#00171F] dark:text-white ${
                    isActive("/dashboard")
                      ? "text-[#00171F] dark:text-white"
                      : "text-[#00171F] dark:text-white/70"
                  }`}
                >
                  <FiHome className="text-lg" />
                  <span>Dashboard</span>
                </Link>

                {user.role === "student" && (
                  <Link
                    to="/assessment"
                    className={`flex items-center gap-2 text-sm font-bold transition-colors hover:text-[#00171F] dark:text-white ${
                      isActive("/assessment")
                        ? "text-[#00171F] dark:text-white"
                        : "text-[#00171F] dark:text-white/70"
                    }`}
                  >
                    <FiClipboard className="text-lg" />
                    <span>Assessment</span>
                  </Link>
                )}

                {(user.role === "admin" || user.role === "superadmin") && (
                  <Link
                    to="/admin"
                    className={`flex items-center gap-2 text-sm font-bold transition-colors hover:text-[#00171F] dark:text-white ${
                      isActive("/admin")
                        ? "text-[#00171F] dark:text-white"
                        : "text-[#00171F] dark:text-white/70"
                    }`}
                  >
                    <FiShield className="text-lg" />
                    <span>Admin Panel</span>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Profile (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full bg-black/[0.05] dark:bg-white/10 hover:bg-black/[0.1] dark:hover:bg-white/20 text-[#00171F] dark:text-white transition-all flex items-center justify-center"
            title="Toggle Theme"
          >
            {theme === "dark" ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>

          {user && (
            <>
              <div className="flex items-center gap-3">
                <div className="text-right hidden lg:block">
                  <p className="text-xs font-bold text-[#00171F] dark:text-white/90">
                    {user.name || "User"}
                  </p>
                  <p className="text-[10px] uppercase font-bold text-[#00171F] dark:text-white/60 tracking-wider">
                    {user.role === "student" ? "Candidate" : user.role}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#00171F] dark:bg-white/20 border border-white/30 flex items-center justify-center text-[#00171F] dark:text-white font-bold text-sm ring-2 ring-white/10 hover:bg-[#00171F] dark:bg-white hover:text-[#00A8E8] transition-colors cursor-pointer">
                  {user.role?.charAt(0).toUpperCase()}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-10 h-10 rounded-full bg-black/[0.05] dark:bg-[#00171F] dark:bg-white/10 hover:bg-red-500/80 text-[#00171F] dark:text-white/70 hover:text-[#00171F] dark:text-white transition-all flex items-center justify-center"
                title="Logout"
              >
                <FiLogOut size={18} />
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-[#00171F] dark:text-white hover:bg-black/[0.05] dark:bg-[#00171F] dark:bg-white/10 rounded-lg transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-x-0 top-[64px] bg-[#00A8E8]/95 backdrop-blur-xl border-b border-[#00A8E8]/20 transition-all duration-300 overflow-hidden md:hidden ${
          isMobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-4 flex flex-col gap-2">
          {!user ? (
            <>
              <Link
                to="/"
                onClick={closeMenu}
                className={`p-3 rounded-lg flex items-center gap-3 font-bold transition-colors ${
                  isActive("/")
                    ? "bg-[#00171F] dark:bg-white/20 text-[#00171F] dark:text-white"
                    : "text-[#00171F] dark:text-white/70 hover:bg-black/[0.05] dark:bg-[#00171F] dark:bg-white/10"
                }`}
              >
                <FiHome /> Home
              </Link>
              <Link
                to="/login"
                onClick={closeMenu}
                className="mt-2 w-full bg-[#00171F] dark:bg-white text-[#00A8E8] font-bold py-3 rounded-lg flex items-center justify-center hover:bg-light transition-colors"
              >
                Sign In
              </Link>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 p-3 mb-2 bg-black/[0.05] dark:bg-[#00171F] dark:bg-white/10 rounded-lg border border-black/[0.08] dark:border-white/10">
                <div className="w-10 h-10 rounded-full bg-[#00171F] dark:bg-white text-[#00A8E8] flex items-center justify-center font-bold">
                  {user.role?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-[#00171F] dark:text-white">
                    Hello, {user.name || "Candidate"}
                  </p>
                  <p className="text-xs text-[#00171F] dark:text-white/70 uppercase tracking-wider font-semibold">
                    {user.role === "student" ? "Candidate" : user.role}
                  </p>
                </div>
              </div>

              <Link
                to="/dashboard"
                onClick={closeMenu}
                className={`p-3 rounded-lg flex items-center gap-3 font-bold transition-colors ${
                  isActive("/dashboard")
                    ? "bg-[#00171F] dark:bg-white/20 text-[#00171F] dark:text-white"
                    : "text-[#00171F] dark:text-white/70 hover:bg-black/[0.05] dark:bg-[#00171F] dark:bg-white/10"
                }`}
              >
                <FiHome /> Dashboard
              </Link>

              {user.role === "student" && (
                <>
                  <Link
                    to="/profile"
                    onClick={closeMenu}
                    className={`p-3 rounded-lg flex items-center gap-3 font-bold transition-colors ${
                      isActive("/profile")
                        ? "bg-[#00171F] dark:bg-white/20 text-[#00171F] dark:text-white"
                        : "text-[#00171F] dark:text-white/70 hover:bg-black/[0.05] dark:bg-[#00171F] dark:bg-white/10"
                    }`}
                  >
                    <FiUser /> My Profile
                  </Link>
                  <Link
                    to="/assessment"
                    onClick={closeMenu}
                    className={`p-3 rounded-lg flex items-center gap-3 font-bold transition-colors ${
                      isActive("/assessment")
                        ? "bg-[#00171F] dark:bg-white/20 text-[#00171F] dark:text-white"
                        : "text-[#00171F] dark:text-white/70 hover:bg-black/[0.05] dark:bg-[#00171F] dark:bg-white/10"
                    }`}
                  >
                    <FiClipboard /> Assessment
                  </Link>
                  <Link
                    to="/results"
                    onClick={closeMenu}
                    className={`p-3 rounded-lg flex items-center gap-3 font-bold transition-colors ${
                      isActive("/results")
                        ? "bg-[#00171F] dark:bg-white/20 text-[#00171F] dark:text-white"
                        : "text-[#00171F] dark:text-white/70 hover:bg-black/[0.05] dark:bg-[#00171F] dark:bg-white/10"
                    }`}
                  >
                    <FiPieChart /> Global Results
                  </Link>
                </>
              )}

              {(user.role === "admin" || user.role === "superadmin") && (
                <Link
                  to="/admin"
                  onClick={closeMenu}
                  className={`p-3 rounded-lg flex items-center gap-3 font-bold transition-colors ${
                    isActive("/admin")
                      ? "bg-[#00171F] dark:bg-white/20 text-[#00171F] dark:text-white"
                      : "text-[#00171F] dark:text-white/70 hover:bg-black/[0.05] dark:bg-[#00171F] dark:bg-white/10"
                  }`}
                >
                  <FiShield /> Admin Panel
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="mt-2 w-full p-3 rounded-lg flex items-center justify-center gap-2 font-bold bg-black/[0.05] dark:bg-[#00171F] dark:bg-white/10 text-[#00171F] dark:text-white hover:bg-[#00171F] dark:bg-white/20 transition-colors"
              >
                <FiLogOut /> Logout
              </button>
            </>
          )}

          <button
            onClick={toggleTheme}
            className="mt-2 w-full p-3 rounded-lg flex items-center justify-center gap-2 font-bold bg-black/[0.05] dark:bg-white/10 text-[#00171F] dark:text-white hover:bg-black/[0.1] dark:hover:bg-white/20 transition-colors"
          >
            {theme === "dark" ? <FiSun /> : <FiMoon />}{" "}
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
