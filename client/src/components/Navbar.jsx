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
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const closeMenu = () => setIsMobileMenuOpen(false);

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
    <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <div className="navbar-container">
        {/* Logo Section */}
        {/* Logo Section */}
        {/* Logo Section */}
        {/* Logo Section */}
        <Link to="/" onClick={closeMenu} className="nav-logo">
          <div className="logo-wrapper">
            <div className="logo-glow"></div>
            <img
              src="logo2.png"
              alt="Mentora Ai Logo"
              className="nav-brand-logo"
            />
            <div className="logo-text-group">
              <span className="logo-text-black">MentorPath</span>
              <span className="ai-accent">Ai</span>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="nav-desktop">
          {!user ? (
            <div className="nav-links-guest">
              <Link
                to="/"
                className={`nav-link ${isActive("/") ? "active" : ""}`}
              >
                Home
              </Link>
              <Link to="/login" className="btn-signin">
                Sign In
              </Link>
            </div>
          ) : (
            <div className="nav-links-auth">
              <Link
                to="/dashboard"
                className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}
              >
                <FiHome className="nav-icon" />
                <span>Dashboard</span>
              </Link>

              {user.role === "student" && (
                <Link
                  to="/assessment"
                  className={`nav-link ${isActive("/assessment") ? "active" : ""}`}
                >
                  <FiClipboard className="nav-icon" />
                  <span>Assessment</span>
                </Link>
              )}

              {(user.role === "admin" || user.role === "superadmin") && (
                <Link
                  to="/admin"
                  className={`nav-link admin-link ${isActive("/admin") ? "active" : ""}`}
                >
                  <FiShield className="nav-icon" />
                  <span>Admin Panel</span>
                </Link>
              )}

              <div className="user-profile">
                <div className="user-avatar">
                  {user.role?.charAt(0).toUpperCase()}
                </div>
                <span className="user-role-label">{user.role}</span>
              </div>

              <button
                onClick={handleLogout}
                className="btn-logout"
                type="button"
              >
                <FiLogOut />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu ${isMobileMenuOpen ? "open" : ""}`}>
        <div className="mobile-menu-content">
          {!user ? (
            <>
              <Link
                to="/"
                onClick={closeMenu}
                className={`mobile-link ${isActive("/") ? "active" : ""}`}
              >
                <FiHome /> Home
              </Link>
              <Link
                to="/login"
                onClick={closeMenu}
                className="mobile-btn-signin"
              >
                Sign In
              </Link>
            </>
          ) : (
            <>
              <div className="mobile-user-header">
                <div className="user-avatar-badge">
                  {user.role?.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <span className="user-name">
                    Hello, {user.name || "Student"}
                  </span>
                  <span className="user-role-badge">{user.role}</span>
                </div>
              </div>

              <div className="mobile-nav-group">
                <Link
                  to="/dashboard"
                  onClick={closeMenu}
                  className={`mobile-link ${isActive("/dashboard") ? "active" : ""}`}
                >
                  <FiHome className="mobile-icon" /> Dashboard
                </Link>

                {user.role === "student" && (
                  <>
                    <Link
                      to="/profile"
                      onClick={closeMenu}
                      className={`mobile-link ${isActive("/profile") ? "active" : ""}`}
                    >
                      <FiUser className="mobile-icon" /> My Profile
                    </Link>
                    <Link
                      to="/assessment"
                      onClick={closeMenu}
                      className={`mobile-link ${isActive("/assessment") ? "active" : ""}`}
                    >
                      <FiClipboard className="mobile-icon" /> Assessment
                    </Link>
                    <Link
                      to="/results"
                      onClick={closeMenu}
                      className={`mobile-link ${isActive("/results") ? "active" : ""}`}
                    >
                      <FiPieChart className="mobile-icon" /> Results
                    </Link>
                  </>
                )}

                {(user.role === "admin" || user.role === "superadmin") && (
                  <Link
                    to="/admin"
                    onClick={closeMenu}
                    className={`mobile-link ${isActive("/admin") ? "active" : ""}`}
                  >
                    <FiShield className="mobile-icon" /> Admin Panel
                  </Link>
                )}
              </div>

              <div className="mobile-divider"></div>

              <button onClick={handleLogout} className="mobile-btn-logout">
                <FiLogOut className="mobile-icon" /> Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
