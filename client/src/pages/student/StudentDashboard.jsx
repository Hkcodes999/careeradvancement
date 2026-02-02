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
      <div className="min-h-screen bg-bg-light flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <FiLoader className="text-4xl text-accent-blue animate-spin" />
          <p className="text-text-muted font-medium">
            Authenticating AI Session...
          </p>
        </div>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-bg-light font-sans pt-[72px]">
      <StudentSidebar />
      <main className="flex-1 p-6 md:p-12 md:ml-64 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-12 pb-6 border-b border-slate-200">
          <h1 className="text-3xl md:text-4xl font-extrabold text-primary-dark tracking-tight mb-3">
            Dashboard
          </h1>
          <p className="text-xl text-text-muted flex items-center gap-3">
            Welcome,
            <strong className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-lg font-bold border border-indigo-100">
              {userName}
            </strong>
          </p>
        </div>

        {/* STEP 1: COMPLETE PROFILE */}
        {!status?.profileComplete && (
          <div className="max-w-3xl bg-amber-50 border border-amber-200 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 mb-8 transition-transform hover:-translate-y-1 hover:shadow-lg">
            <div className="p-4 bg-white rounded-full text-amber-500 shadow-sm">
              <FiAlertCircle size={32} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-bold text-amber-900 mb-2">
                Incomplete Profile
              </h3>
              <p className="text-amber-700/80 mb-0">
                Please complete your profile to unlock career recommendations.
              </p>
            </div>
            <button
              onClick={() => navigate("/profile")}
              className="px-6 py-3 bg-white text-amber-700 font-bold rounded-xl border border-amber-200 shadow-sm hover:bg-amber-100 transition-colors"
            >
              Update Profile
            </button>
          </div>
        )}

        {/* STEP 2: LINK COLLEGE */}
        {status?.profileComplete && !status?.institutionId && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-primary-dark">
              Link Your Institution
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {institutions.map((inst) => (
                <div
                  key={inst._id}
                  className="bg-white border border-slate-200 rounded-2xl p-8 hover:-translate-y-1 hover:shadow-xl hover:border-accent-blue/30 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 bg-blue-50 text-accent-blue rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <FiMapPin size={24} />
                  </div>
                  <h4 className="text-lg font-bold text-primary-dark mb-4">
                    {inst.name}
                  </h4>
                  <button
                    disabled={selecting}
                    onClick={() => handleLinkInstitution(inst._id)}
                    className="w-full py-3 bg-white border-2 border-slate-100 text-slate-600 font-bold rounded-xl hover:bg-accent-blue hover:text-white hover:border-accent-blue transition-all disabled:opacity-50"
                  >
                    {selecting ? "Linking..." : "Select Campus"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2.5: TARGET SELECTION */}
        {status?.institutionId && !status?.stream && (
          <div className="max-w-3xl bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-5 mb-6">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <FiLayers size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary-dark">
                  Target Upgrade Domain
                </h3>
                <p className="text-text-muted mt-1">
                  Assess your readiness for your next career move.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <select
                value={selectedTarget}
                onChange={(e) => setSelectedTarget(e.target.value)}
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-primary-dark focus:outline-none focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue transition-all"
              >
                <option value="">-- Select Goal --</option>
                {getTargetOptions(status.educationLevel).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>
              <button
                className="px-8 py-3 bg-primary-dark text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:translate-y-0"
                onClick={handleConfirmTarget}
                disabled={autopilotLoading}
              >
                {autopilotLoading ? (
                  <span className="flex items-center gap-2">
                    <FiLoader className="animate-spin" /> Creating...
                  </span>
                ) : (
                  "Create My Batch"
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: WAITING / BATCH READY */}
        {status?.institutionId && status?.stream && (
          <div className="max-w-4xl mx-auto mt-8">
            {!status.assigned || isTailoring ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-blue via-accent-purple to-accent-amber animate-gradient-shift"></div>

                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <FiClock size={40} />
                </div>

                <h3 className="text-2xl font-bold text-primary-dark mb-4">
                  Tailoring Assessment...
                </h3>
                <p className="text-lg text-text-muted mb-8 max-w-xl mx-auto">
                  Building a bridge between{" "}
                  <strong className="text-primary-dark">
                    {status.profileStream}
                  </strong>{" "}
                  and{" "}
                  <strong className="text-primary-dark">{status.stream}</strong>
                  .
                </p>

                <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-slate-50 rounded-full border border-slate-200 text-sm font-medium text-slate-500 mb-8">
                  <FiLoader className="animate-spin text-accent-blue" />
                  AI Engine generating batch architecture...
                </div>

                <div className="flex justify-center">
                  <button
                    className="flex items-center gap-2 px-6 py-2.5 text-slate-500 hover:text-primary-dark hover:bg-slate-50 rounded-lg transition-colors font-medium text-sm"
                    onClick={() => loadDashboard(false)}
                  >
                    <FiRefreshCw /> Check Manual Status
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-10 md:p-12 text-white shadow-2xl relative overflow-hidden group">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full -translate-x-1/3 translate-y-1/3 blur-2xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-6 border border-white/20">
                      <FiCheckCircle /> Batch Ready
                    </div>
                    <h3 className="text-3xl md:text-4xl font-black mb-4">
                      {status.stream} Assessment
                    </h3>
                    <p className="text-indigo-100 text-lg max-w-lg leading-relaxed">
                      Your personalized bridge assessment for{" "}
                      <span className="font-semibold text-white">
                        {status.educationLevel}
                      </span>{" "}
                      level is ready to begin.
                    </p>
                  </div>

                  <button
                    className="px-8 py-4 bg-white text-indigo-700 font-black text-lg rounded-xl shadow-lg hover:shadow-white/20 hover:scale-105 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 group-hover:ring-4 ring-white/30"
                    onClick={() => navigate("/assessment")}
                  >
                    Start Now{" "}
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
