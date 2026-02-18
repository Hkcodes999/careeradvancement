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
    <div className="flex min-h-screen bg-surface font-sans pt-[72px]">
      <StudentSidebar />
      <main className="flex-1 p-6 md:p-10 md:ml-72 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-10 pb-6 border-b border-secondary/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-text-main tracking-tight mb-2">
              Candidate Dashboard
            </h1>
            <p className="text-text-muted">
              Manage your academic journey and assessments
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-secondary/20 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-light flex items-center justify-center text-primary font-bold">
              {userName.charAt(0)}
            </div>
            <div>
              <p className="text-xs text-text-light font-bold uppercase">
                Welcome back
              </p>
              <p className="text-sm font-bold text-text-main">{userName}</p>
            </div>
          </div>
        </div>

        {/* STEP 1: COMPLETE PROFILE */}
        {!status?.profileComplete && (
          <div className="max-w-4xl mx-auto bg-amber-50 border border-amber-100 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 mb-8 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="p-4 bg-white rounded-2xl text-amber-500 shadow-sm animate-bounce-slow">
              <FiAlertCircle size={32} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold text-amber-900 mb-2">
                Action Required: Complete Profile
              </h3>
              <p className="text-amber-700/80 mb-0 font-medium">
                We need a bit more info to customize your learning path.
              </p>
            </div>
            <button
              onClick={() => navigate("/profile")}
              className="px-8 py-3 bg-white text-amber-700 font-bold rounded-xl border border-amber-200 shadow-sm hover:bg-amber-100 transition-colors"
            >
              Update Now
            </button>
          </div>
        )}

        {/* STEP 2: LINK COLLEGE */}
        {status?.profileComplete && !status?.institutionId && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-1 bg-primary rounded-full"></div>
              <h3 className="text-2xl font-bold text-text-main">
                Select Your Institution
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {institutions.map((inst) => (
                <div
                  key={inst._id}
                  className="bg-white border border-secondary/10 p-8 rounded-3xl shadow-soft hover:shadow-soft-xl hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-light rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>

                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-light text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-sm">
                      <FiMapPin size={28} />
                    </div>
                    <h4 className="text-xl font-bold text-text-main mb-4 leading-tight">
                      {inst.name}
                    </h4>
                    <button
                      disabled={selecting}
                      onClick={() => handleLinkInstitution(inst._id)}
                      className="w-full py-3.5 bg-surface border border-secondary/20 text-text-muted font-bold rounded-xl hover:bg-primary hover:text-white hover:border-primary transition-all disabled:opacity-50"
                    >
                      {selecting ? "Connecting..." : "Connect Campus"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2.5: TARGET SELECTION */}
        {status?.institutionId && !status?.stream && (
          <div className="max-w-3xl mx-auto bg-white border border-secondary/10 p-8 md:p-10 rounded-3xl shadow-soft">
            <div className="flex items-start gap-5 mb-8">
              <div className="p-4 bg-light text-primary rounded-2xl shadow-sm">
                <FiTarget size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-text-main">
                  Choose Your Path
                </h3>
                <p className="text-text-muted mt-1 font-medium">
                  Where do you want to go next? We'll tailor the assessment for
                  you.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <select
                  value={selectedTarget}
                  onChange={(e) => setSelectedTarget(e.target.value)}
                  className="w-full px-5 py-4 bg-surface border-transparent rounded-xl font-bold text-text-main focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select your goal...</option>
                  {getTargetOptions(status.educationLevel).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                  <option value="Other">Other</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-light">
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
              <div className="glass-panel p-10 text-center relative overflow-hidden bg-white border border-secondary/10 rounded-3xl shadow-soft">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-secondary via-primary to-secondary animate-gradient-shift"></div>

                <div className="w-24 h-24 bg-light text-primary rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse shadow-sm">
                  <FiClock size={48} />
                </div>

                <h3 className="text-3xl font-bold text-text-main mb-4">
                  AI is crafting your path...
                </h3>
                <p className="text-lg text-text-muted mb-8 max-w-xl mx-auto font-medium">
                  Analyzing profile:{" "}
                  <span className="text-primary">{status.profileStream}</span>
                  <br />
                  Targeting:{" "}
                  <span className="text-text-main">{status.stream}</span>
                </p>

                <div className="inline-flex items-center gap-3 px-6 py-3 bg-light rounded-full border border-secondary/20 text-sm font-bold text-text-muted mb-8">
                  <FiLoader className="animate-spin text-primary" />
                  Generating personalized assessment architecture...
                </div>

                <div className="flex justify-center">
                  <button
                    className="flex items-center gap-2 px-6 py-2.5 text-text-light hover:text-primary hover:bg-light rounded-xl transition-colors font-bold text-sm"
                    onClick={() => loadDashboard(false)}
                  >
                    <FiRefreshCw /> Refresh Status
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-primary to-secondary rounded-3xl p-10 md:p-14 text-white shadow-soft-2xl relative overflow-hidden group">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl pointer-events-none mix-blend-overlay"></div>
                <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/10 rounded-full -translate-x-1/3 translate-y-1/3 blur-2xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-white/10 shadow-lg">
                      <FiCheckCircle className="text-white" /> Assessment Ready
                    </div>
                    <h3 className="text-4xl md:text-5xl font-display font-bold mb-4 tracking-tight">
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

                  <button
                    className="px-10 py-5 bg-white text-primary font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3"
                    onClick={() => navigate("/assessment")}
                  >
                    Start Now
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
