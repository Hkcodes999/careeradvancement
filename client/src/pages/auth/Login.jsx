import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import {
  FiEye,
  FiEyeOff,
  FiAlertTriangle,
  FiArrowLeft,
  FiArrowRight,
  FiMail,
  FiPhone,
  FiLock,
  FiBriefcase,
  FiCheckCircle,
} from "react-icons/fi";

import { useAuth } from "../../context/AuthContext";
import {
  loginUser,
  googleLogin,
  updateRole,
  forgotPassword,
  resetPassword,
} from "../../services/authApi";

const Login = () => {
  /* ---------------- STATE ---------------- */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("student");
  const [remember, setRemember] = useState(false);
  const [capsOn, setCapsOn] = useState(false);

  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotMethod, setForgotMethod] = useState("email"); // "email" or "whatsapp"
  const [forgotEmail, setForgotEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(false);
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
        score <= 1
          ? "text-red-500"
          : score === 2
            ? "text-amber-500"
            : "text-primary",
    };
  };

  const strength = getPasswordStrength(password);
  const handleKeyEvent = (e) => setCapsOn(e.getModifierState("CapsLock"));

  const completeLogin = (userData, isRemember) => {
    login({
      token: userData.token,
      role: userData.role,
      name: userData.name || userData.username || userData.fullName,
      remember: isRemember,
    });
    toast.success("Welcome back!");
    navigate("/dashboard");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginUser({ email, password, role });
      if (res.success) completeLogin(res.data, remember);
      else toast.error(res.message || "Invalid credentials");
    } catch (err) {
      toast.error("Connection error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (cred) => {
    setLoading(true);
    try {
      const res = await googleLogin({ token: cred.credential });
      if (res.success) {
        if (res.data.role) completeLogin(res.data, true);
        else {
          setTempToken(res.data.token);
          setShowRoleModal(true);
        }
      } else toast.error(res.message || "Google login failed");
    } catch (err) {
      toast.error("Google login failed");
    } finally {
      setLoading(false);
    }
  };

  const submitGoogleRole = async () => {
    if (!tempToken) return;
    setLoading(true);
    try {
      const res = await updateRole(tempToken, role);
      if (res.success) {
        completeLogin(
          { token: tempToken, role: res.role || res.data.role },
          true,
        );
        setShowRoleModal(false);
      } else toast.error(res.message || "Failed to update role");
    } catch (err) {
      toast.error("Error updating role");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOTP = async () => {
    setLoading(true);
    try {
      const payload =
        forgotMethod === "email"
          ? { email: forgotEmail }
          : { phone: phone, email: forgotEmail };

      const res = await forgotPassword(payload);
      if (res.success) {
        toast.success(`OTP Sent to your ${forgotMethod}!`);
        setForgotStep(2);
      } else toast.error(res.message);
    } catch (err) {
      toast.error("Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      const res = await resetPassword({ email: forgotEmail, otp, newPassword });
      if (res.success) {
        toast.success("Password Updated!");
        setShowForgot(false);
        setForgotStep(1);
      } else toast.error(res.message);
    } catch (err) {
      toast.error("Reset failed");
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
              Welcome back
            </h1>
            <p className="text-text-muted text-lg">
              Please enter your details to sign in.
            </p>
          </header>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-5">
              <div className="relative group">
                <label className="text-sm font-semibold text-text-main ml-1 mb-1 block">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light group-focus-within:text-primary transition-colors text-lg" />
                  <input
                    type="email"
                    className="w-full pl-12 pr-4 py-3 bg-white border border-secondary/30 rounded-xl text-text-main placeholder-text-light/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all shadow-sm"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="relative group">
                <div className="flex justify-between items-end mb-1">
                  <label className="text-sm font-semibold text-text-main ml-1">
                    Password
                  </label>
                  {password && (
                    <span
                      className={`text-xs font-bold uppercase ${strength.color}`}
                    >
                      {strength.label}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light group-focus-within:text-primary transition-colors text-lg" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full pl-12 pr-12 py-3 bg-white border border-secondary/30 rounded-xl text-text-main placeholder-text-light/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all shadow-sm"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyUp={handleKeyEvent}
                    autoComplete="current-password"
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
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
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

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-primary rounded border-secondary/30 bg-white focus:ring-primary/25"
                    checked={remember}
                    onChange={() => setRemember(!remember)}
                  />
                  <span className="text-sm font-medium text-text-muted group-hover:text-primary transition-colors">
                    Keep me logged in
                  </span>
                </label>
                <button
                  type="button"
                  className="text-sm font-bold text-primary hover:text-primary-hover transition-colors hover:underline"
                  onClick={() => setShowForgot(true)}
                >
                  Forgot Password?
                </button>
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
                  Sign In <FiArrowRight className="text-xl" />
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
                Or continue with
              </span>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                theme="outline"
                shape="pill"
                text="continue_with"
                width="100%"
              />
            </div>
          </div>

          <p className="text-center text-text-muted">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-bold text-primary hover:text-primary-hover transition-colors hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* --- RIGHT SIDE: VISUAL --- */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary to-secondary relative justify-center items-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2301&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/50 to-primary/30"></div>

        <div className="relative z-10 max-w-lg text-white p-12">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20">
            <FiBriefcase size={32} className="text-white" />
          </div>
          <h2 className="text-4xl font-display font-bold leading-tight mb-6 text-white">
            Your gateway to <br />
            <span className="text-light">career excellence.</span>
          </h2>
          <p className="text-lg text-white/80 leading-relaxed mb-8">
            Access personalized career insights, market trends, and a roadmap
            tailored just for you.
          </p>
        </div>
      </div>

      {/* --- ROLE COMPLETION MODAL --- */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface rounded-3xl shadow-2xl p-8 max-w-sm w-full animate-slide-up relative overflow-hidden border border-secondary/20">
            <h3 className="text-2xl font-bold text-text-main mb-2">
              Finalize Profile
            </h3>
            <p className="text-text-muted mb-6">
              Please select your intended role to complete registration.
            </p>

            <div className="space-y-4">
              <div className="relative">
                <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light z-10" />
                <select
                  className="w-full pl-12 pr-4 py-3 bg-white border border-secondary/30 rounded-xl text-text-main focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all appearance-none"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>
              <button
                className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary-hover transition-all"
                onClick={submitGoogleRole}
                disabled={loading}
              >
                {loading ? "Finalizing..." : "Complete Setup"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- FORGOT PASSWORD MODAL --- */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface rounded-2xl shadow-2xl p-8 max-w-sm w-full animate-slide-up relative border border-secondary/20">
            <header className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-text-main">
                Account Recovery
              </h3>
              <button
                className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                onClick={() => setShowForgot(false)}
              >
                <span className="text-2xl leading-none">&times;</span>
              </button>
            </header>

            {forgotStep === 1 ? (
              <div className="space-y-6">
                <div className="flex bg-light p-1 rounded-xl border border-secondary/20">
                  <button
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                      forgotMethod === "email"
                        ? "bg-white text-primary shadow-sm"
                        : "text-text-muted hover:text-text-main"
                    }`}
                    onClick={() => setForgotMethod("email")}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <FiMail /> Email
                    </div>
                  </button>
                  <button
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                      forgotMethod === "whatsapp"
                        ? "bg-white text-primary shadow-sm"
                        : "text-text-muted hover:text-text-main"
                    }`}
                    onClick={() => setForgotMethod("whatsapp")}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <FiPhone /> WhatsApp
                    </div>
                  </button>
                </div>

                <p className="text-sm text-text-muted text-center">
                  {forgotMethod === "email"
                    ? "Enter your email to receive a secure OTP code."
                    : "Enter your phone number linked to WhatsApp."}
                </p>

                {forgotMethod === "email" ? (
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light text-lg" />
                    <input
                      type="email"
                      className="w-full pl-12 pr-4 py-3 bg-white border border-secondary/30 rounded-xl text-text-main placeholder-text-light focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                      placeholder="Email Address"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light text-lg" />
                    <input
                      type="tel"
                      className="w-full pl-12 pr-4 py-3 bg-white border border-secondary/30 rounded-xl text-text-main placeholder-text-light focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                      placeholder="+91 XXXXX XXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                )}

                <button
                  className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary-hover transition-all"
                  onClick={handleRequestOTP}
                  disabled={loading}
                >
                  Request OTP
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <p className="text-sm text-text-muted text-center bg-light p-3 rounded-lg border border-secondary/20">
                  A 6-digit code was sent to your{" "}
                  <strong>{forgotMethod}</strong>.
                </p>

                <input
                  className="w-full text-center text-2xl tracking-[0.5em] font-mono font-bold bg-white border border-secondary/30 rounded-xl text-text-main py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                />

                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light text-lg" />
                  <input
                    type="password"
                    className="w-full pl-12 pr-4 py-3 bg-white border border-secondary/30 rounded-xl text-text-main placeholder-text-light focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <button
                  className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary-hover transition-all"
                  onClick={handleResetPassword}
                  disabled={loading}
                >
                  Update Credentials
                </button>

                <button
                  className="w-full text-sm font-bold text-text-muted hover:text-primary transition-colors flex items-center justify-center gap-2 mt-2"
                  onClick={() => setForgotStep(1)}
                >
                  <FiArrowLeft /> Try another method
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
