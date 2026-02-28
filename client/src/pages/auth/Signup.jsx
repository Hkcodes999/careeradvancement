import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
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

import {
  signupUser,
  googleLogin,
  verifyEmailOTP,
} from "../../services/authApi";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.png";

const Signup = () => {
  /* ---------------- STATE ---------------- */
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const navigate = useNavigate();
  const location = useLocation();
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
    const returnTo = location.state?.returnTo || "/dashboard";
    navigate(returnTo, { replace: true });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    let explicitRole = "general";
    const returnTo = location.state?.returnTo || "";
    if (returnTo.includes("batch=")) {
      explicitRole = "campus_student";
    }

    const payload = { ...form, role: explicitRole };

    try {
      const res = await signupUser(payload);
      if (res.success) {
        setVerificationEmail(res.data?.email || form.email);
        setShowVerificationModal(true);
      } else toast.error(res.message || "Registration failed");
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
      const res = await verifyEmailOTP({
        email: verificationEmail,
        otp: otpValue,
      });
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

    let explicitRole = "general";
    const returnTo = location.state?.returnTo || "";
    if (returnTo.includes("batch=")) {
      explicitRole = "campus_student";
    }

    try {
      const res = await googleLogin({
        token: cred.credential,
        role: explicitRole,
      });
      if (res.success) {
        completeSignup(res.data);
      } else toast.error(res.message || "Google signup failed");
    } catch {
      toast.error("Google signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#F8FAFC] dark:bg-gray-900 overflow-hidden font-sans text-gray-900 dark:text-gray-100 relative transition-colors duration-300">
      {/* Subtle Abstract Background Texture */}
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(0,168,232,0.04)_0%,rgba(248,250,252,0)_60%)] dark:bg-[radial-gradient(ellipse_at_top_right,rgba(0,168,232,0.1)_0%,transparent_60%)] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,126,167,0.04)_0%,rgba(248,250,252,0)_60%)] dark:bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,126,167,0.1)_0%,transparent_60%)] pointer-events-none"></div>

      {/* Top Left Logo (Aligned exactly like Navbar) */}
      <div className="absolute top-0 left-0 w-full h-20 px-4 sm:px-6 lg:px-8 flex items-center z-20">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-fit h-full group-hover:scale-105 transition-transform rounded-xl">
            <img src={logo} alt="Logo" className="w-15 h-12" />
          </div>
          <div className="hidden md:flex flex-col">
            <span className="font-display font-bold text-2xl leading-none text-gray-900 dark:text-white tracking-tight">
              Career <span className="text-[#00A8E8]">Advancement</span>
            </span>
          </div>
        </Link>
      </div>

      {/* --- CENTERED CARD --- */}
      <div className="w-full max-w-[420px] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[1.5rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] relative z-10 animate-fade-in-up mt-10 transition-colors duration-300">
        <header className="mb-6 text-center">
          <h1 className="text-[26px] font-bold text-gray-900 dark:text-white mb-1.5 tracking-tight transition-colors">
            Create an account
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium transition-colors">
            Join CareerAdvancement today
          </p>
        </header>

        <form onSubmit={handleSignup} className="space-y-4">
          {/* TOP-ALIGNED LABEL INPUT: NAME */}
          <div className="space-y-1.5 group">
            <label
              htmlFor="name"
              className="block text-xs font-semibold text-gray-600 dark:text-gray-300 ml-1 transition-colors group-focus-within:text-[#00A8E8] dark:group-focus-within:text-[#00A8E8]"
            >
              Full Name
            </label>
            <div className="relative">
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-[#00A8E8] dark:group-focus-within:text-[#00A8E8] transition-colors z-10" />
              <input
                name="name"
                type="text"
                id="name"
                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-2xl pl-11 pr-4 py-3 text-gray-900 dark:text-white text-sm outline-none focus:border-[#00A8E8] dark:focus:border-[#00A8E8] focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-[#00A8E8]/20 transition-all placeholder-gray-400 dark:placeholder-gray-500"
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
              className="block text-xs font-semibold text-gray-600 dark:text-gray-300 ml-1 transition-colors group-focus-within:text-[#00A8E8] dark:group-focus-within:text-[#00A8E8]"
            >
              Email Address
            </label>
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-[#00A8E8] dark:group-focus-within:text-[#00A8E8] transition-colors z-10" />
              <input
                name="email"
                type="email"
                id="email"
                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-2xl pl-11 pr-4 py-3 text-gray-900 dark:text-white text-sm outline-none focus:border-[#00A8E8] dark:focus:border-[#00A8E8] focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-[#00A8E8]/20 transition-all placeholder-gray-400 dark:placeholder-gray-500"
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
                className="block text-xs font-semibold text-gray-600 dark:text-gray-300 transition-colors group-focus-within:text-[#00A8E8] dark:group-focus-within:text-[#00A8E8]"
              >
                Password
              </label>
            </div>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-[#00A8E8] dark:group-focus-within:text-[#00A8E8] transition-colors z-10" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                id="password"
                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-2xl pl-11 pr-12 py-3 text-gray-900 dark:text-white text-sm outline-none focus:border-[#00A8E8] dark:focus:border-[#00A8E8] focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-[#00A8E8]/20 transition-all placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                onKeyUp={handleKeyEvent}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors rounded-full"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          {/* Minimal Password Strength */}
          <div className="flex justify-between items-center px-2 pt-1">
            <div className="flex gap-1.5 flex-1 max-w-[120px]">
              <div
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${form.password.length > 0 ? strength.color : "bg-gray-200"}`}
              ></div>
              <div
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${strength.label === "Medium" || strength.label === "Strong" ? strength.color : "bg-gray-200"}`}
              ></div>
              <div
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${strength.label === "Strong" ? strength.color : "bg-gray-200"}`}
              ></div>
            </div>
            {form.password && (
              <span
                className={`text-[10px] font-bold uppercase tracking-widest ${strength.textColor}`}
              >
                {strength.label}
              </span>
            )}
          </div>

          {capsOn && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-xl text-xs font-medium border border-amber-200 dark:border-amber-700/50 animate-fade-in-up mt-2 transition-colors">
              <FiAlertTriangle size={14} /> <span>Caps Lock is active</span>
            </div>
          )}

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
            <div className="w-full border-t border-gray-100 dark:border-gray-700 transition-colors"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white dark:bg-gray-800 px-3 text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-colors">
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

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 font-medium mt-8 transition-colors">
          Already have an account?{" "}
          <Link
            to="/login"
            state={{ returnTo: location.state?.returnTo }}
            className="font-semibold text-[#00A8E8] hover:text-[#007EA7] transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>

      {/* --- EMAIL VERIFICATION MODAL --- */}
      {showVerificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/60 animate-fade-in backdrop-blur-sm transition-colors">
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[1.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-6 sm:p-10 max-w-[460px] w-full animate-slide-up relative overflow-hidden flex flex-col items-center transition-colors">
            <button
              onClick={() => setShowVerificationModal(false)}
              className="absolute top-6 left-6 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 transition-colors"
            >
              <FiArrowLeft size={22} />
            </button>

            <h2 className="text-[26px] font-bold text-gray-900 dark:text-white text-center mb-2 tracking-tight mt-2 transition-colors">
              Verify your email
            </h2>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 text-center mb-6 font-medium leading-relaxed w-full px-4 transition-colors">
              We sent a verification code to{" "}
              <span className="text-gray-900 dark:text-white font-bold break-words inline-block max-w-[280px] align-top transition-colors">
                {verificationEmail}
              </span>
              <br />
              <span className="block mt-1">
                Check your spam folder or junk email folder for code
              </span>
            </p>

            <div className="w-full space-y-5">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 whitespace-normal transition-colors">
                Verification Code
              </label>

              <div className="flex justify-between gap-2 sm:gap-3 w-full">
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    className="w-11 h-12 sm:w-[52px] sm:h-14 text-center text-xl sm:text-2xl font-bold bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:border-[#00A8E8] dark:focus:border-[#00A8E8] focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-[#00A8E8]/20 text-gray-900 dark:text-white transition-all placeholder-gray-300 dark:placeholder-gray-600 shadow-sm"
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
                <span className="text-[13px] font-medium text-gray-500 dark:text-gray-400 transition-colors">
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
