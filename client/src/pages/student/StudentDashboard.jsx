import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentSidebar from "../../components/StudentSidebar";
import { fetchStudentBatchStatus } from "../../services/studentApi";
import {
  fetchInstitutions,
  selectInstitution,
} from "../../services/institutionApi";
import { runAutopilotEngine } from "../../services/aiApi";
import { toast } from "react-toastify";
import {
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiLoader,
  FiLayers,
  FiMapPin,
  FiRefreshCw,
  FiArrowRight,
  FiTrendingUp,
  FiTarget,
} from "react-icons/fi";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const pollInterval = useRef(null);

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [userName, setUserName] = useState("");
  const [institutions, setInstitutions] = useState([]);
  const [selecting, setSelecting] = useState(false);
  const [autopilotLoading, setAutopilotLoading] = useState(false);
  const [isTailoring, setIsTailoring] = useState(false);

  const [selectedTarget, setSelectedTarget] = useState("");
  const [customTarget, setCustomTarget] = useState("");

  const getTargetOptions = (level) => {
    const targetMap = {
      "10th": ["Science (PCM/PCB)", "Commerce", "Arts", "Diploma"],
      "12th": ["Engineering", "Medical", "BCA", "BBA", "B.Sc IT"],
      Diploma: ["B.E/B.Tech Lateral", "Aviation", "Design"],
      UG: ["M.Tech", "MBA", "MCA", "Software Development"],
      PG: ["Ph.D", "Industry Specialization"],
    };
    return targetMap[level] || ["General Aptitude"];
  };

  const stopPolling = () => {
    if (pollInterval.current) {
      clearInterval(pollInterval.current);
      pollInterval.current = null;
    }
  };

  const startPolling = (currentStatus) => {
    if (!pollInterval.current) {
      pollInterval.current = setInterval(() => {
        handleTriggerAutopilot(currentStatus, true);
      }, 5000);
    }
  };

  const loadDashboard = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const res = await fetchStudentBatchStatus();
      setStatus(res);
      if (res.userName) setUserName(res.userName);

      if (res.profileComplete && !res.institutionId) {
        const instRes = await fetchInstitutions();
        setInstitutions(instRes.institutions || []);
      }

      // If domain is selected but batch is not assigned, start looking for it
      if (res.institutionId && res.stream && !res.assigned) {
        startPolling(res);
      }
    } catch (err) {
      toast.error("Dashboard Sync Error");
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    return () => stopPolling();
  }, []);

  const handleLinkInstitution = async (instId) => {
    try {
      setSelecting(true);
      await selectInstitution(instId);
      toast.success("College Linked");
      await loadDashboard(false);
    } catch (err) {
      toast.error("Link Failed");
    } finally {
      setSelecting(false);
    }
  };

  /* ================= STEP 2.5: TARGET SELECTION ================= */
  const handleConfirmTarget = async () => {
    const finalTarget =
      selectedTarget === "Other" ? customTarget : selectedTarget;
    if (!finalTarget) {
      toast.warn("Please select a target domain");
      return;
    }

    try {
      setAutopilotLoading(true);
      setIsTailoring(true);

      // 1. Save Target to DB
      await selectInstitution(status.institutionId, finalTarget);

      // 2. Refresh status to confirm "stream" is saved
      const updatedStatus = await fetchStudentBatchStatus();
      setStatus(updatedStatus);

      // 3. Explicitly call engine to create batch
      await handleTriggerAutopilot(updatedStatus);

      // 4. Forced 10-second wait for UI
      setTimeout(() => {
        setIsTailoring(false);
        setAutopilotLoading(false);
      }, 10000);
    } catch (err) {
      toast.error("Batch Initiation Failed");
      setIsTailoring(false);
      setAutopilotLoading(false);
    }
  };

  /* ================= STEP 3: ENGINE TRIGGER ================= */
  const handleTriggerAutopilot = async (currentStatus, isPolling = false) => {
    if (!currentStatus?.stream) return;

    try {
      const res = await runAutopilotEngine({
        educationLevel: currentStatus.educationLevel,
        currentStream: currentStatus.profileStream, // Current knowledge
        stream: currentStatus.stream, // Target domain
      });

      if (res.status === "ready") {
        stopPolling();
        const finalStatus = await fetchStudentBatchStatus();
        setStatus(finalStatus);
      } else {
        if (!isPolling) startPolling(currentStatus);
      }
    } catch (err) {
      if (!isPolling) stopPolling();
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-secondary/30 border-t-primary rounded-full animate-spin"></div>
          <p className="text-text-muted font-bold animate-pulse">
            Syncing Candidate Profile...
          </p>
        </div>
      </div>
    );

  return (
    <div className="relative flex min-h-screen bg-surface dark:bg-[#00171F] font-sans overflow-hidden">
      {/* Background Decor - Matches Home Page Aesthetics */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Deep Tech Background Effects (Copied perfectly from Home.jsx for blending) */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#00A8E8]/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-50 dark:opacity-100"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#007EA7]/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-50 dark:opacity-100"></div>
        <div className="absolute top-[40%] left-[60%] w-[400px] h-[400px] bg-[#00A8E8]/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen opacity-50 dark:opacity-100"></div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 z-0 overflow-hidden opacity-20 hidden md:block">
          <svg
            className="absolute w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="dashboard-grid"
                w="40"
                h="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-black/[0.1] dark:text-white/20"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dashboard-grid)" />
          </svg>
        </div>
      </div>

      <div className="relative z-10 flex w-full">
        <StudentSidebar />
        <main className="flex-1 p-6 md:p-10 md:ml-72 max-w-7xl mx-auto w-full pt-[40px] md:pt-10">
          {/* Header */}
          <div className="mb-10 pb-6 border-b border-black/[0.05] dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="animate-fade-in-up">
              <h1 className="text-4xl md:text-5xl font-display font-extrabold text-[#1C1E21] dark:text-white tracking-tight mb-2 drop-shadow-sm">
                Candidate Dashboard
              </h1>
              <p className="text-lg text-[#4B5563] dark:text-white/60 font-medium">
                Manage your academic journey and track assessments.
              </p>
            </div>

            {/* User Profile Pill */}
            <div className="flex items-center gap-4 bg-white/70 dark:bg-[#00171F]/50 backdrop-blur-xl px-5 py-3 rounded-3xl border border-black/5 dark:border-white/10 shadow-soft-sm">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00A8E8] to-[#007EA7] flex items-center justify-center text-white font-bold text-lg shadow-inner ring-2 ring-white/20 dark:ring-white/5">
                {userName?.charAt(0) || "U"}
              </div>
              <div>
                <p className="text-[10px] text-[#4B5563] dark:text-white/50 font-bold uppercase tracking-widest mb-0.5">
                  Welcome back
                </p>
                <p className="text-base font-bold text-[#1C1E21] dark:text-white leading-none">
                  {userName}
                </p>
              </div>
            </div>
          </div>

          {/* STEP 1: COMPLETE PROFILE */}
          {!status?.profileComplete && (
            <div className="max-w-4xl mx-auto mt-8 bg-gradient-to-r from-amber-500/10 to-amber-600/5 dark:from-amber-500/20 dark:to-orange-500/10 backdrop-blur-xl border border-amber-500/20 dark:border-amber-500/30 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-soft-xl transition-all duration-300 relative overflow-hidden group">
              {/* Optional background glow */}
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-amber-400/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-400/30 transition-colors pointer-events-none"></div>

              <div className="p-5 bg-white shadow-xl shadow-amber-500/10 dark:shadow-none dark:bg-amber-500/20 rounded-[20px] text-amber-500 animate-bounce-slow relative z-10">
                <FiAlertCircle size={36} strokeWidth={2.5} />
              </div>
              <div className="flex-1 text-center md:text-left relative z-10">
                <h3 className="text-2xl font-bold text-amber-900 dark:text-amber-400 mb-2 tracking-tight">
                  Action Required: Complete Profile
                </h3>
                <p className="text-amber-800/80 dark:text-amber-200/80 text-lg font-medium">
                  We need a bit more info to intelligently customize your
                  learning path.
                </p>
              </div>
              <button
                onClick={() => navigate("/profile")}
                className="relative z-10 px-8 py-3.5 bg-amber-500 text-white font-bold rounded-2xl shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
              >
                Update Now
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

          {/* STEP 2: LINK COLLEGE */}
          {status?.profileComplete && !status?.institutionId && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-1 bg-primary rounded-full"></div>
                <h3 className="text-2xl font-bold text-text-main dark:text-white">
                  Select Your Institution
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {institutions.map((inst) => (
                  <div
                    key={inst._id}
                    className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 p-8 rounded-3xl shadow-soft hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
                  >
                    {/* Decorative Corner */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#00A8E8]/10 to-transparent dark:from-white/5 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>

                    <div className="relative z-10">
                      <div className="w-14 h-14 bg-gradient-to-br from-[#00A8E8]/10 to-[#007EA7]/10 dark:from-white/10 dark:to-white/5 text-[#00A8E8] dark:text-white rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#00A8E8] group-hover:text-white transition-colors duration-300 shadow-sm border border-[#00A8E8]/20 dark:border-white/10">
                        <FiMapPin size={28} />
                      </div>
                      <h4 className="text-xl font-bold text-[#1C1E21] dark:text-white mb-6 leading-tight group-hover:text-[#00A8E8] transition-colors">
                        {inst.name}
                      </h4>
                      <button
                        disabled={selecting}
                        onClick={() => handleLinkInstitution(inst._id)}
                        className="w-full py-3.5 bg-white dark:bg-[#00171F]/50 border border-black/10 dark:border-white/10 text-[#4B5563] dark:text-white/80 font-bold rounded-xl hover:bg-[#00A8E8] dark:hover:bg-[#00A8E8] hover:text-white dark:hover:text-white hover:border-[#00A8E8] dark:hover:border-[#00A8E8] transition-all disabled:opacity-50 shadow-sm hover:shadow-md"
                      >
                        {selecting ? (
                          <span className="flex items-center justify-center gap-2">
                            <FiLoader className="animate-spin" /> Connecting...
                          </span>
                        ) : (
                          "Connect Campus"
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2.5: TARGET SELECTION */}
          {status?.institutionId && !status?.stream && (
            <div className="max-w-3xl mx-auto bg-white/80 dark:bg-[#00171F]/50 backdrop-blur-xl border border-black/5 dark:border-white/10 p-8 md:p-10 rounded-3xl shadow-soft relative overflow-hidden">
              {/* Optional Subtle Glow Inside */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#00A8E8]/5 rounded-full blur-[60px] pointer-events-none"></div>

              <div className="flex flex-col md:flex-row items-start gap-6 mb-8 relative z-10">
                <div className="p-4 bg-gradient-to-br from-[#00A8E8]/10 to-[#007EA7]/10 dark:from-white/10 dark:to-white/5 text-[#00A8E8] dark:text-white rounded-2xl shadow-sm border border-[#00A8E8]/20 dark:border-white/10">
                  <FiTarget size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-text-main dark:text-white">
                    Choose Your Path
                  </h3>
                  <p className="text-text-muted dark:text-white/70 mt-1 font-medium">
                    Where do you want to go next? We'll tailor the assessment
                    for you.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <select
                    value={selectedTarget}
                    onChange={(e) => setSelectedTarget(e.target.value)}
                    className="w-full px-5 py-4 bg-surface dark:bg-white/5 border-transparent dark:border-white/10 rounded-xl font-bold text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-white/20 focus:bg-white dark:focus:bg-[#00171F] transition-all appearance-none cursor-pointer"
                  >
                    <option value="" className="text-gray-900">
                      Select your goal...
                    </option>
                    {getTargetOptions(status.educationLevel).map((opt) => (
                      <option key={opt} value={opt} className="text-gray-900">
                        {opt}
                      </option>
                    ))}
                    <option value="Other" className="text-gray-900">
                      Other
                    </option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-light dark:text-white/50">
                    <FiLayers />
                  </div>
                </div>

                <button
                  className="px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-70 disabled:translate-y-0"
                  onClick={handleConfirmTarget}
                  disabled={autopilotLoading}
                >
                  {autopilotLoading ? (
                    <span className="flex items-center gap-2">
                      <FiLoader className="animate-spin" /> Designing...
                    </span>
                  ) : (
                    "Create Roadmap"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: WAITING / BATCH READY */}
          {status?.institutionId && status?.stream && (
            <div className="max-w-4xl mx-auto mt-8">
              {!status.assigned || isTailoring ? (
                <div className="bg-white/80 dark:bg-[#00171F]/50 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-3xl p-10 text-center relative overflow-hidden shadow-soft">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#00A8E8] via-[#007EA7] to-[#00A8E8] animate-gradient-shift"></div>

                  <div className="w-24 h-24 bg-gradient-to-br from-[#00A8E8]/10 to-[#007EA7]/10 dark:from-white/10 dark:to-white/5 text-[#00A8E8] dark:text-white rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse shadow-sm border border-[#00A8E8]/20 dark:border-white/10">
                    <FiClock size={48} />
                  </div>

                  <h3 className="text-3xl font-display font-bold text-[#1C1E21] dark:text-white mb-4">
                    AI is crafting your path...
                  </h3>
                  <p className="text-lg text-[#4B5563] dark:text-white/70 mb-8 max-w-xl mx-auto font-medium leading-relaxed">
                    Analyzing profile:{" "}
                    <span className="text-[#00A8E8] font-bold">
                      {status.profileStream}
                    </span>
                    <br />
                    Targeting:{" "}
                    <span className="text-[#1C1E21] dark:text-white font-bold">
                      {status.stream}
                    </span>
                  </p>

                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-[#F8F9FA] dark:bg-white/5 rounded-full border border-black/5 dark:border-white/10 text-sm font-bold text-[#4B5563] dark:text-white/70 mb-8 shadow-sm">
                    <FiLoader className="animate-spin text-[#00A8E8] dark:text-white" />
                    Generating personalized assessment architecture...
                  </div>

                  <div className="flex justify-center">
                    <button
                      className="flex items-center gap-2 px-6 py-2.5 text-[#4B5563] dark:text-white/50 hover:text-[#1C1E21] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-all font-bold text-sm"
                      onClick={() => loadDashboard(false)}
                    >
                      <FiRefreshCw /> Refresh Status
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-[#00A8E8] to-[#007EA7] dark:from-[#00171F] dark:to-[#003459] rounded-3xl p-10 md:p-14 text-white shadow-soft-2xl relative overflow-hidden group border dark:border-white/10 transition-transform hover:scale-[1.01] duration-500">
                  {/* Background Decor */}
                  <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-[80px] pointer-events-none mix-blend-overlay"></div>
                  <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full -translate-x-1/3 translate-y-1/3 blur-[60px] pointer-events-none"></div>

                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                    <div className="flex-1">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-white/20 shadow-lg text-white">
                        <FiCheckCircle className="text-white" /> Assessment
                        Ready
                      </div>
                      <h3 className="text-4xl md:text-5xl font-display font-extrabold mb-4 tracking-tight text-white drop-shadow-md">
                        {status.stream}
                      </h3>
                      <p className="text-white/80 text-lg max-w-lg leading-relaxed font-medium">
                        Your personalized bridge assessment for{" "}
                        <span className="font-bold text-white border-b-2 border-white/30">
                          {status.educationLevel}
                        </span>{" "}
                        level is ready.
                      </p>
                    </div>

                    <div className="mt-8 md:mt-0">
                      <button
                        className="px-10 py-5 bg-white text-[#00A8E8] dark:text-[#00171F] font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 group/btn"
                        onClick={() => navigate("/assessment")}
                      >
                        Start Now
                        <FiArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
