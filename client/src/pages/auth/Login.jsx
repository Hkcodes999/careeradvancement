import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import {
  FiEye,
  FiEyeOff,
  FiAlertTriangle,
  FiMail,
  FiPhone,
  FiLock,
  FiBriefcase,
  FiArrowLeft,
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
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [tempToken, setTempToken] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  /* ---------------- LOGIC ---------------- */
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
    } catch {
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
    } catch {
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
    } catch {
      toast.error("Error updating role");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;
    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    if (element.nextSibling && element.value) {
      element.nextSibling.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!otp[index] && e.target.previousSibling) {
        setOtp([...otp.map((d, idx) => (idx === index - 1 ? "" : d))]);
        e.target.previousSibling.focus();
      } else {
        setOtp([...otp.map((d, idx) => (idx === index ? "" : d))]);
      }
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
    } catch {
      toast.error("Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword({ email: forgotEmail, otp: otpValue, newPassword });
      if (res.success) {
        toast.success("Password Updated!");
        setShowForgot(false);
        setForgotStep(1);
        setOtp(new Array(6).fill(""));
        setNewPassword("");
      } else toast.error(res.message);
    } catch {
      toast.error("Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#F8FAFC] overflow-hidden font-sans text-gray-900 relative">
      {/* Subtle Abstract Background Texture (Light Version) */}
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(0,168,232,0.04)_0%,rgba(248,250,252,0)_60%)] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,126,167,0.04)_0%,rgba(248,250,252,0)_60%)] pointer-events-none"></div>

      {/* Top Left Logo (Aligned exactly like Navbar) */}
      <div className="absolute top-0 left-0 w-full h-20 px-4 sm:px-6 lg:px-8 flex items-center z-20">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-10 h-10 bg-[#00171F] rounded-lg shadow-lg group-hover:scale-105 transition-transform">
            <span className="text-[#00A8E8] font-extrabold text-xl">C</span>
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-display font-bold text-2xl leading-none text-gray-900 tracking-tight">
              Career <span className="text-[#00A8E8]">Advancement</span>
            </span>
          </div>
        </Link>
      </div>

      {/* --- CENTERED CARD (LIGHT) --- */}
      <div className="w-full max-w-[420px] bg-white border border-gray-100 rounded-[1.5rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative z-10 animate-fade-in-up mt-10">
        
        <header className="mb-6 text-center">
          <h1 className="text-[26px] font-bold text-gray-900 mb-1.5 tracking-tight">
            Welcome back
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            Sign in to continue
          </p>
        </header>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* TOP-ALIGNED LABEL INPUT: EMAIL */}
          <div className="space-y-1.5 group">
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-gray-600 ml-1 transition-colors group-focus-within:text-[#00A8E8]"
            >
              Email Address
            </label>
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#00A8E8] transition-colors z-10" />
              <input
                type="email"
                id="email"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-gray-900 text-sm outline-none focus:border-[#00A8E8] focus:bg-white focus:ring-2 focus:ring-[#00A8E8]/20 transition-all placeholder-gray-400"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* TOP-ALIGNED LABEL INPUT: PASSWORD */}
          <div className="space-y-1.5 group">
            <div className="flex justify-between items-end ml-1 mr-1">
               <label
                htmlFor="password"
                className="block text-xs font-semibold text-gray-600 transition-colors group-focus-within:text-[#00A8E8]"
              >
                Password
              </label>
            </div>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#00A8E8] transition-colors z-10" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-11 pr-12 py-3 text-gray-900 text-sm outline-none focus:border-[#00A8E8] focus:bg-white focus:ring-2 focus:ring-[#00A8E8]/20 transition-all placeholder-gray-400"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyUp={handleKeyEvent}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-700 transition-colors rounded-full"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          {capsOn && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-700 rounded-xl text-xs font-medium border border-amber-200 animate-fade-in-up mt-2">
              <FiAlertTriangle size={14} /> <span>Caps Lock is active</span>
            </div>
          )}

          {/* SELECT ROLE */}
          <div className="space-y-1.5 group pt-1">
             <label
              htmlFor="role"
              className="block text-xs font-semibold text-gray-600 ml-1 transition-colors group-focus-within:text-[#00A8E8]"
            >
              Signing in as
            </label>
            <div className="relative">
              <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#00A8E8] transition-colors z-10" />
              <select
                id="role"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-gray-900 text-sm outline-none focus:border-[#00A8E8] focus:bg-white focus:ring-2 focus:ring-[#00A8E8]/20 transition-all appearance-none cursor-pointer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="student">Student</option>
                <option value="admin">Administrator</option>
                <option value="superadmin">Super Admin</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 pb-3">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  className="peer appearance-none w-[18px] h-[18px] border-[1.5px] border-gray-300 rounded bg-white checked:bg-[#00A8E8] checked:border-[#00A8E8] focus:ring-2 focus:ring-offset-1 focus:ring-[#00A8E8]/30 transition-all cursor-pointer"
                  checked={remember}
                  onChange={() => setRemember(!remember)}
                />
                <FiCheckCircle className="absolute text-white opacity-0 peer-checked:opacity-100 w-[12px] h-[12px] pointer-events-none transition-opacity stroke-[3]" />
              </div>
              <span className="text-xs font-medium text-gray-500 group-hover:text-gray-800 transition-colors">
                Remember me
              </span>
            </label>
            <button
              type="button"
              className="text-xs font-semibold text-gray-500 hover:text-[#00A8E8] transition-colors"
              onClick={() => setShowForgot(true)}
            >
              Forgot password?
            </button>
          </div>

          <button
            className="w-full py-3.5 bg-gradient-to-b from-[#00A8E8] to-[#007EA7] text-white text-sm font-bold rounded-xl shadow-[0_4px_12px_rgba(0,168,232,0.25)] hover:shadow-[0_6px_16px_rgba(0,168,232,0.35)] hover:-translate-y-[1px] transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin mx-auto"></div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="relative py-4 my-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
              Or
            </span>
          </div>
        </div>

        <div className="flex justify-center w-full">
          <div className="w-full flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              theme="outline"
              type="standard"
              size="large"
              shape="rectangular"
              text="signin_with"
              context="signin"
              width="100%"
              logo_alignment="center"
            />
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 font-medium mt-8">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-semibold text-[#00A8E8] hover:text-[#007EA7] transition-colors"
          >
            Create one
          </Link>
        </p>
      </div>

      {/* --- ROLE COMPLETION MODAL --- */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 animate-fade-in backdrop-blur-sm">
          <div className="bg-white border border-gray-100 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] p-8 max-w-sm w-full animate-slide-up relative">
            <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">
              Finalize Profile
            </h3>
            <p className="text-gray-500 text-sm mb-6 font-medium">
              Please select your intended role to complete registration.
            </p>

            <div className="space-y-5">
              <div className="relative group">
                <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors z-10" />
                <select
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 text-sm focus:outline-none focus:border-[#00A8E8] focus:ring-2 focus:ring-[#00A8E8]/20 focus:bg-white transition-all appearance-none"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <button
                className="w-full py-3 bg-gradient-to-b from-[#00A8E8] to-[#007EA7] text-white text-sm font-bold rounded-xl shadow-[0_4px_12px_rgba(0,168,232,0.25)] hover:shadow-[0_6px_16px_rgba(0,168,232,0.35)] hover:-translate-y-[1px] transition-all disabled:opacity-70"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 animate-fade-in backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] p-8 sm:p-10 max-w-[420px] w-full animate-slide-up relative">
            
            {forgotStep === 1 ? (
              <>
                <h2 className="text-3xl font-bold text-[#0F172A] text-center mb-3 tracking-tight">
                  Forgot Password
                </h2>
                <p className="text-sm text-[#475569] text-center mb-8 px-2 font-medium leading-relaxed">
                  Enter your email address and we'll send you a code to reset your password.
                </p>

                <div className="space-y-6">
                  <div className="space-y-2 group">
                    <label className="block text-[13px] font-bold text-[#334155] ml-1 transition-colors group-focus-within:text-[#00A8E8]">
                      Email address
                    </label>
                    <input
                      type="email"
                      className="w-full bg-white border border-[#E2E8F0] rounded-[1rem] px-4 py-4 text-[#0F172A] text-[15px] outline-none focus:border-[#00A8E8] focus:ring-4 focus:ring-[#00A8E8]/10 transition-all placeholder-[#94A3B8]"
                      placeholder="you@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    className="w-full py-4 bg-[#00A8E8] hover:bg-[#007EA7] text-white text-[15px] font-bold rounded-[1rem] transition-all disabled:opacity-70 mt-2 shadow-[0_4px_14px_rgba(0,168,232,0.25)] hover:shadow-[0_6px_20px_rgba(0,168,232,0.35)] hover:-translate-y-[1px]"
                    onClick={handleRequestOTP}
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send Reset Code"}
                  </button>

                  <div className="text-center mt-6">
                    <button
                      className="text-[14px] font-semibold text-[#00A8E8] hover:text-[#007EA7] transition-colors"
                      onClick={() => { setShowForgot(false); setForgotStep(1); }}
                    >
                      Back to Sign in
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* STEP 2 */}
                <h2 className="text-3xl font-bold text-[#0F172A] text-center mb-3 tracking-tight">
                  Verification Code
                </h2>
                <p className="text-sm text-[#475569] text-center mb-8 px-2 font-medium leading-relaxed">
                  Enter the 6-digit code sent to <br className="hidden sm:block" />
                  <strong className="text-[#0F172A] break-words inline-block max-w-[280px] align-top">{forgotEmail}</strong>.
                </p>

                <div className="space-y-6">
                  <div className="space-y-3 group">
                    <label className="block text-[13px] font-bold text-[#334155] ml-1 transition-colors group-focus-within:text-[#00A8E8]">
                      Verification Code
                    </label>
                    <div className="flex justify-between gap-1 sm:gap-2 w-full px-1">
                      {otp.map((data, index) => (
                        <input
                          key={index}
                          type="text"
                          maxLength="1"
                          className="w-10 h-12 sm:w-[48px] sm:h-[56px] text-center text-xl sm:text-2xl font-bold bg-white border border-[#E2E8F0] rounded-[1rem] focus:outline-none focus:border-[#00A8E8] focus:bg-[#f8fafc] focus:ring-4 focus:ring-[#00A8E8]/10 transition-all placeholder-gray-300 shadow-sm"
                          value={data}
                          onChange={(e) => handleOtpChange(e.target, index)}
                          onKeyDown={(e) => handleOtpKeyDown(e, index)}
                          onFocus={(e) => e.target.select()}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 group">
                    <label className="block text-[13px] font-bold text-[#334155] ml-1 transition-colors group-focus-within:text-[#00A8E8]">
                      New Password
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-[#00A8E8] transition-colors z-10" />
                      <input
                        type="password"
                        className="w-full bg-white border border-[#E2E8F0] rounded-[1rem] pl-11 pr-4 py-4 text-[#0F172A] text-[15px] outline-none focus:border-[#00A8E8] focus:ring-4 focus:ring-[#00A8E8]/10 transition-all placeholder-[#94A3B8]"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    className="w-full py-4 bg-[#00A8E8] hover:bg-[#007EA7] text-white text-[15px] font-bold rounded-[1rem] transition-all disabled:opacity-70 mt-2 shadow-[0_4px_14px_rgba(0,168,232,0.25)] hover:shadow-[0_6px_20px_rgba(0,168,232,0.35)] hover:-translate-y-[1px]"
                    onClick={handleResetPassword}
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Update Password"}
                  </button>

                  <div className="text-center mt-6">
                    <button
                      className="text-[14px] font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors"
                      onClick={() => setForgotStep(1)}
                    >
                      Back to Email
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
