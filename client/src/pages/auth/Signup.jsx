import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import {
  FiEye,
  FiEyeOff,
  FiAlertTriangle,
  FiArrowRight,
  FiMail,
  FiLock,
  FiUser,
  FiCheckCircle,
  FiBriefcase,
} from "react-icons/fi";

import { useAuth } from "../../context/AuthContext";
import { signupUser, googleLogin } from "../../services/authApi";

const Signup = () => {
  /* ---------------- STATE ---------------- */
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [loading, setLoading] = useState(false);

  // Google Role Completion States
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [tempToken, setTempToken] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  /* ---------------- LOGIC ---------------- */
  const getPasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return {
      label: score <= 1 ? "Weak" : score === 2 ? "Medium" : "Strong",
      color:
        score <= 1 ? "bg-red-500" : score === 2 ? "bg-amber-500" : "bg-primary",
      textColor:
        score <= 1
          ? "text-red-500"
          : score === 2
            ? "text-amber-500"
            : "text-primary",
      width:
        score === 0 ? "0%" : score <= 1 ? "33%" : score === 2 ? "66%" : "100%",
    };
  };

  const strength = getPasswordStrength(form.password);
  const handleKeyEvent = (e) => setCapsOn(e.getModifierState("CapsLock"));

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const completeSignup = (userData) => {
    login({
      token: userData.token,
      role: userData.role,
      name:
        userData.name || userData.username || userData.fullName || form.name,
    });
    toast.success("Account created successfully!");
    navigate("/dashboard");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signupUser(form);
      if (res.success) completeSignup(res.data);
      else toast.error(res.message || "Registration failed");
    } catch (err) {
      toast.error("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (cred) => {
    setLoading(true);
    try {
      const res = await googleLogin({ token: cred.credential });
      if (res.success) {
        if (res.data.role) completeSignup(res.data);
        else {
          setTempToken(res.data.token);
          setShowRoleModal(true);
        }
      } else toast.error(res.message || "Google signup failed");
    } catch (err) {
      toast.error("Google signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-surface font-sans text-text-main">
      {/* --- LEFT SIDE: FORM --- */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          <header className="mb-10 text-center lg:text-left">
            <Link to="/" className="inline-block group mb-8">
              <span className="font-display font-bold text-3xl tracking-tight text-text-main group-hover:text-primary transition-colors">
                Career <span className="text-primary">Advancement</span>
              </span>
            </Link>
            <h1 className="text-4xl font-display font-bold text-text-main mb-2">
              Create your account
            </h1>
            <p className="text-text-muted text-lg">
              Start building your career roadmap today.
            </p>
          </header>

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-5">
              <div className="relative group">
                <label className="text-sm font-semibold text-text-main ml-1 mb-1 block">
                  Full Name
                </label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light group-focus-within:text-primary transition-colors text-lg" />
                  <input
                    name="name"
                    type="text"
                    className="w-full pl-12 pr-4 py-3 bg-white border border-secondary/30 rounded-xl text-text-main placeholder-text-light/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all shadow-sm"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="relative group">
                <label className="text-sm font-semibold text-text-main ml-1 mb-1 block">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light group-focus-within:text-primary transition-colors text-lg" />
                  <input
                    name="email"
                    type="email"
                    className="w-full pl-12 pr-4 py-3 bg-white border border-secondary/30 rounded-xl text-text-main placeholder-text-light/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all shadow-sm"
                    placeholder="name@company.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="relative group">
                <div className="flex justify-between items-end mb-1">
                  <label className="text-sm font-semibold text-text-main ml-1">
                    Password
                  </label>
                  {form.password && (
                    <span
                      className={`text-xs font-bold uppercase ${strength.textColor}`}
                    >
                      {strength.label}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light group-focus-within:text-primary transition-colors text-lg" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className="w-full pl-12 pr-12 py-3 bg-white border border-secondary/30 rounded-xl text-text-main placeholder-text-light/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all shadow-sm"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    onKeyUp={handleKeyEvent}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-text-light hover:text-primary transition-colors rounded-lg hover:bg-surface"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                <div className="h-1 w-full bg-secondary/10 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full transition-all duration-300 ${strength.color}`}
                    style={{ width: strength.width }}
                  ></div>
                </div>
              </div>

              {capsOn && (
                <div className="flex items-center gap-2 p-3 bg-amber-500/10 text-amber-500 rounded-lg text-sm font-medium border border-amber-500/20">
                  <FiAlertTriangle /> <span>Caps Lock is active</span>
                </div>
              )}

              <div className="relative group">
                <label className="text-sm font-semibold text-text-main ml-1 mb-1 block">
                  I am a...
                </label>
                <div className="relative">
                  <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light text-lg z-10" />
                  <select
                    className="w-full pl-12 pr-4 py-3 bg-white border border-secondary/30 rounded-xl text-text-main focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all appearance-none cursor-pointer shadow-sm"
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                  >
                    <option value="student">Student</option>
                    <option value="admin">Administrator</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-light">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <button
              className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-hover hover:shadow-primary/30 hover:-translate-y-1 transition-all disabled:opacity-70 disabled:translate-y-0 flex items-center justify-center gap-2"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
              ) : (
                <>
                  Create Account <FiArrowRight className="text-xl" />
                </>
              )}
            </button>
          </form>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-secondary/20"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-surface px-4 text-sm font-semibold text-text-muted uppercase tracking-widest">
                Or joined with
              </span>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                theme="outline"
                shape="pill"
                text="signup_with"
                width="100%"
              />
            </div>
          </div>

          <p className="text-center text-text-muted">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold text-primary hover:text-primary-hover transition-colors hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>

      {/* --- RIGHT SIDE: VISUAL --- */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary to-secondary relative justify-center items-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/50 to-primary/30"></div>

        <div className="relative z-10 max-w-lg text-white p-12">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20 text-white">
            <FiCheckCircle size={32} />
          </div>
          <blockquote className="text-3xl font-display font-bold leading-relaxed mb-8 text-white">
            "CareerAdvancement analyzed my skills in minutes and gave me a
            roadmap I actually used to get my first internship."
          </blockquote>
          <div className="flex items-center gap-4">
            <img
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
              alt="Student"
              className="w-12 h-12 rounded-full border-2 border-white"
            />
            <div>
              <p className="font-bold text-lg text-white">Emily Chen</p>
              <p className="text-white/70">Computer Science, Class of '24</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- ROLE MODAL (Keep Existing Logic) --- */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface rounded-3xl shadow-2xl p-8 max-w-sm w-full animate-slide-up relative overflow-hidden border border-secondary/20">
            <h3 className="text-2xl font-bold text-text-main mb-2">
              Complete Registration
            </h3>
            <p className="text-text-muted mb-6">
              Select your role to finish setting up your account.
            </p>

            <div className="space-y-4">
              <div className="relative">
                <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light z-10" />
                <select
                  className="w-full pl-12 pr-4 py-3 bg-white border border-secondary/30 rounded-xl text-text-main focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all appearance-none"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>

              <button
                className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary-hover transition-all"
                onClick={() => {
                  /* Logic placeholder */
                }}
                disabled={loading}
              >
                {loading ? "Finalizing..." : "Complete Setup"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
