import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import {
  FiEye,
  FiEyeOff,
  FiAlertTriangle,
  FiUser,
  FiMail,
  FiLock,
  FiBriefcase,
  FiArrowLeft,
} from "react-icons/fi";

import { signupUser, googleLogin, verifyEmailOTP } from "../../services/authApi";
import { useAuth } from "../../context/AuthContext";

const Signup = () => {
  /* ---------------- STATE ---------------- */
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [tempToken, setTempToken] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const navigate = useNavigate();
  const { login } = useAuth();

  /* ---------------- LOGIC ---------------- */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

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
          ? "bg-red-500"
          : score === 2
            ? "bg-amber-500"
            : "bg-[#00A8E8]",
      textColor:
        score <= 1
          ? "text-red-500"
          : score === 2
            ? "text-amber-500"
            : "text-[#00A8E8]",
    };
  };

  const strength = getPasswordStrength(form.password);
  const handleKeyEvent = (e) => setCapsOn(e.getModifierState("CapsLock"));

  const completeSignup = (userData) => {
    login({
      token: userData.token,
      role: userData.role,
      name: userData.name || userData.username || userData.fullName,
    });
    toast.success("Account created successfully!");
    navigate("/dashboard");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signupUser(form);
      if (res.success) {
        setVerificationEmail(res.data?.email || form.email);
        setShowVerificationModal(true);
      }
      else toast.error(res.message || "Registration failed");
    } catch {
      toast.error("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.nextSibling && element.value !== "") {
      element.nextSibling.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyEmailOTP({ email: verificationEmail, otp: otpValue });
      if (res.success) {
        completeSignup(res.data);
      } else {
        toast.error(res.message || "Invalid verification code");
      }
    } catch {
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
    } catch {
      toast.error("Google signup failed");
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
          <div className="hidden md:flex flex-col">
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
            Create an account
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            Join CareerAdvancement today
          </p>
        </header>

        <form onSubmit={handleSignup} className="space-y-4">
          {/* TOP-ALIGNED LABEL INPUT: NAME */}
          <div className="space-y-1.5 group">
            <label
              htmlFor="name"
              className="block text-xs font-semibold text-gray-600 ml-1 transition-colors group-focus-within:text-[#00A8E8]"
            >
              Full Name
            </label>
            <div className="relative">
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#00A8E8] transition-colors z-10" />
              <input
                name="name"
                type="text"
                id="name"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-gray-900 text-sm outline-none focus:border-[#00A8E8] focus:bg-white focus:ring-2 focus:ring-[#00A8E8]/20 transition-all placeholder-gray-400"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

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
                name="email"
                type="email"
                id="email"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-gray-900 text-sm outline-none focus:border-[#00A8E8] focus:bg-white focus:ring-2 focus:ring-[#00A8E8]/20 transition-all placeholder-gray-400"
                placeholder="name@company.com"
                value={form.email}
                onChange={handleChange}
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
                name="password"
                type={showPassword ? "text" : "password"}
                id="password"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-11 pr-12 py-3 text-gray-900 text-sm outline-none focus:border-[#00A8E8] focus:bg-white focus:ring-2 focus:ring-[#00A8E8]/20 transition-all placeholder-gray-400"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                onKeyUp={handleKeyEvent}
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

          {/* Minimal Password Strength */}
          <div className="flex justify-between items-center px-2 pt-1">
             <div className="flex gap-1.5 flex-1 max-w-[120px]">
               <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${form.password.length > 0 ? strength.color : "bg-gray-200"}`}></div>
               <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${strength.label === "Medium" || strength.label === "Strong" ? strength.color : "bg-gray-200"}`}></div>
               <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${strength.label === "Strong" ? strength.color : "bg-gray-200"}`}></div>
             </div>
             {form.password && (
                <span className={`text-[10px] font-bold uppercase tracking-widest ${strength.textColor}`}>
                  {strength.label}
                </span>
             )}
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
              Signing up as
            </label>
            <div className="relative">
              <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#00A8E8] transition-colors z-10" />
              <select
                name="role"
                id="role"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-gray-900 text-sm outline-none focus:border-[#00A8E8] focus:bg-white focus:ring-2 focus:ring-[#00A8E8]/20 transition-all appearance-none cursor-pointer"
                value={form.role}
                onChange={handleChange}
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

          <button
            className="w-full mt-4 py-3.5 bg-gradient-to-b from-[#00A8E8] to-[#007EA7] text-white text-sm font-bold rounded-xl shadow-[0_4px_12px_rgba(0,168,232,0.25)] hover:shadow-[0_6px_16px_rgba(0,168,232,0.35)] hover:-translate-y-[1px] transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin mx-auto"></div>
            ) : (
              "Create Account"
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
              text="signup_with"
              context="signup"
              width="100%"
              logo_alignment="center"
            />
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 font-medium mt-8">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-[#00A8E8] hover:text-[#007EA7] transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>

      {/* --- ROLE MODAL --- */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 animate-fade-in backdrop-blur-sm">
          <div className="bg-white border border-gray-100 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] p-8 max-w-sm w-full animate-slide-up relative overflow-hidden">
            <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">
              Complete Registration
            </h3>
            <p className="text-gray-500 text-sm mb-6 font-medium">
              Select your role to finish setting up your account.
            </p>

            <div className="space-y-5">
              <div className="relative group">
                <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors z-10" />
                <select
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 text-sm focus:outline-none focus:border-[#00A8E8] focus:ring-2 focus:ring-[#00A8E8]/20 focus:bg-white transition-all appearance-none"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
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
                onClick={() => {
                   /* Intentionally left blank or complete via updateRole API call here if needed */
                }}
                disabled={loading}
              >
                {loading ? "Finalizing..." : "Complete Setup"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- EMAIL VERIFICATION MODAL --- */}
      {showVerificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 animate-fade-in backdrop-blur-sm">
          <div className="bg-white border border-gray-100 rounded-[1.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-6 sm:p-10 max-w-[460px] w-full animate-slide-up relative overflow-hidden flex flex-col items-center">
            
            <button
              onClick={() => setShowVerificationModal(false)}
              className="absolute top-6 left-6 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <FiArrowLeft size={22} />
            </button>
            
            <h2 className="text-[26px] font-bold text-gray-900 text-center mb-2 tracking-tight mt-2">
              Verify your email
            </h2>
            <p className="text-[14px] text-gray-500 text-center mb-6 font-medium leading-relaxed w-full px-4">
              We sent a verification code to <span className="text-gray-900 font-bold break-words inline-block max-w-[280px] align-top">{verificationEmail}</span><br/>
              <span className="block mt-1">Check your spam folder or junk email folder for code</span>
            </p>

            <div className="w-full space-y-5">
              <label className="block text-xs font-semibold text-gray-600 mb-2 whitespace-normal">
                Verification Code
              </label>
              
              <div className="flex justify-between gap-2 sm:gap-3 w-full">
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    className="w-11 h-12 sm:w-[52px] sm:h-14 text-center text-xl sm:text-2xl font-bold bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#00A8E8] focus:bg-white focus:ring-2 focus:ring-[#00A8E8]/20 transition-all placeholder-gray-300"
                    value={data}
                    onChange={(e) => handleOtpChange(e.target, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    onFocus={(e) => e.target.select()}
                  />
                ))}
              </div>

              <button
                className="w-full py-3.5 mt-4 bg-gradient-to-b from-[#00A8E8] to-[#007EA7] text-white text-sm font-bold rounded-xl shadow-[0_4px_12px_rgba(0,168,232,0.25)] hover:shadow-[0_6px_16px_rgba(0,168,232,0.35)] hover:-translate-y-[1px] transition-all duration-300 disabled:opacity-70 flex items-center justify-center"
                onClick={handleVerifyOTP}
                disabled={loading}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                ) : (
                  "Verify Email"
                )}
              </button>

              <div className="text-center mt-6">
                <span className="text-[13px] font-medium text-gray-500">
                  Didn't receive code?{" "}
                  <button className="text-[#00A8E8] hover:text-[#007EA7] font-bold transition-colors">
                    Resend
                  </button>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
