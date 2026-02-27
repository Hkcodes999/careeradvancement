import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import StudentSidebar from "../../components/StudentSidebar";
import {
  fetchStudentBatchStatus,
  fetchAvailableBatches,
  joinBatch,
} from "../../services/studentApi";
import {
  fetchInstitutions,
  selectInstitution,
} from "../../services/institutionApi";
import { toast } from "react-toastify";
import {
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiLoader,
  FiMapPin,
  FiRefreshCw,
  FiArrowRight,
  FiUsers,
} from "react-icons/fi";
import GlobalLoader from "../../components/GlobalLoader";

const Campus = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const pollInterval = useRef(null);

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [userName, setUserName] = useState("");
  const [institutions, setInstitutions] = useState([]);
  const [selecting, setSelecting] = useState(false);
  const [autopilotLoading, setAutopilotLoading] = useState(false);
  const [isTailoring, setIsTailoring] = useState(false);

  const [availableBatches, setAvailableBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(false);

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
      } else if (res.profileComplete && res.institutionId && !res.assigned) {
        try {
          setLoadingBatches(true);
          const batchRes = await fetchAvailableBatches();
          if (batchRes && batchRes.success) {
            setAvailableBatches(batchRes.batches || []);
          }
        } catch (e) {
          console.error("Failed to load batches", e);
        } finally {
          setLoadingBatches(false);
        }
      }

      if (res.assigned && isTailoring) {
        startPolling(res);
      }
    } catch (err) {
      toast.error("Campus Sync Error");
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

  const handleJoinPredefinedBatch = async (batchId) => {
    try {
      setAutopilotLoading(true);
      setIsTailoring(true);

      await joinBatch(batchId);

      const updatedStatus = await fetchStudentBatchStatus();
      setStatus(updatedStatus);

      setTimeout(() => {
        setIsTailoring(false);
        setAutopilotLoading(false);
        loadDashboard(false);
      }, 8000);
    } catch (err) {
      toast.error(err.message || "Failed to join batch");
      setIsTailoring(false);
      setAutopilotLoading(false);
    }
  };

  const handleTriggerAutopilot = async (currentStatus, isPolling = false) => {
    const finalStatus = await fetchStudentBatchStatus();
    setStatus(finalStatus);
  };

  if (loading) return <GlobalLoader />;

  return (
    <div className="relative flex min-h-screen bg-surface dark:bg-[#00171F] font-sans overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#00A8E8]/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-50 dark:opacity-100"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#007EA7]/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-50 dark:opacity-100"></div>
        <div className="absolute top-[40%] left-[60%] w-[400px] h-[400px] bg-[#00A8E8]/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen opacity-50 dark:opacity-100"></div>

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
          <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="animate-fade-in-up">
              <h1 className="text-2xl md:text-4xl font-display font-black text-[#1C1E21] dark:text-white tracking-tight mb-2 drop-shadow-sm">
                My Campus
              </h1>
              <p className="text-sm text-[#4B5563] dark:text-white/60 font-medium">
                Connect to your institution and access assigned training paths.
              </p>
            </div>

            <div className="flex items-center gap-5 bg-white/90 dark:bg-[#00171F]/80 backdrop-blur-xl px-4 py-4 rounded-3xl border border-black/5 dark:border-white/10 shadow-soft-xl relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00A8E8] to-[#007EA7] flex items-center justify-center text-white font-bold text-xl shadow-inner ring-4 ring-primary/10 dark:ring-white/5 capitalize">
                {userName?.charAt(0) || "U"}
              </div>
              <div className="pr-2">
                <p className="text-xs text-[#4B5563] dark:text-white/50 font-bold uppercase tracking-widest mb-1">
                  Candidate
                </p>
                <p className="text-base font-display font-bold text-[#1C1E21] dark:text-white leading-none capitalize">
                  {userName}
                </p>
              </div>
            </div>
          </div>

          {!status?.profileComplete && (
            <div className="max-w-5xl mx-auto mt-30 bg-gradient-to-br from-orange-400 to-amber-500 dark:from-amber-600 dark:to-orange-700 border-none rounded-[2.5rem] p-5 md:p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-orange-500/20 dark:shadow-none relative overflow-hidden group/alert">
              <div className="p-4 bg-white/20 backdrop-blur-md rounded-3xl text-white shadow-inner relative z-10 border border-white/30">
                <FiAlertCircle size={48} strokeWidth={2.5} />
              </div>
              <div className="flex-1 text-center md:text-left relative z-10">
                <h3 className="text-xl md:text-2xl font-display font-black text-white mb-3 tracking-tight">
                  Action Required: Complete Profile
                </h3>
                <p className="text-white/90 text-sm md:text-sm font-medium max-w-2xl leading-relaxed">
                  We need a bit more info to intelligently customize your
                  learning path and fetch campus records.
                </p>
              </div>
              <button
                onClick={() => navigate("/profile")}
                className="relative z-10 px-5 py-3 bg-white text-orange-600 font-black text-lg rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 flex-shrink-0 group/cta"
              >
                Update Now
                <FiArrowRight
                  size={22}
                  className="group-hover/cta:translate-x-1 transition-transform"
                />
              </button>
            </div>
          )}

          {status?.profileComplete && !status?.institutionId && (
            <div className="space-y-6 max-w-5xl mt-12">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-1 bg-gradient-to-b from-[#00A8E8] to-[#007EA7] rounded-full"></div>
                <div>
                  <h3 className="text-xl font-display font-black text-[#1C1E21] dark:text-white tracking-tight">
                    Select Your Campus
                  </h3>
                  <p className="text-[#4B5563] dark:text-white/60 font-medium mt-1 text-xs">
                    Connect your institution to fetch your academic records.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {institutions.map((inst) => {
                  const isCompleted = status?.completedInstitutions?.includes(
                    inst._id,
                  );

                  return (
                    <div
                      key={inst._id}
                      className={`bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 rounded-2xl shadow-soft transition-all duration-300 group relative overflow-hidden flex flex-col shrink-0 min-w-[160px] ${
                        isCompleted
                          ? "opacity-60 grayscale pointer-events-none"
                          : "hover:shadow-soft-xl hover:-translate-y-1"
                      }`}
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#00A8E8]/10 to-transparent dark:from-white/5 rounded-bl-[60px] -mr-6 -mt-6 transition-transform group-hover:scale-110 pointer-events-none"></div>

                      <div className="relative z-10 flex-1">
                        <div
                          className={`w-12 h-12 bg-[#F8F9FA] dark:bg-white/10 text-[#00A8E8] dark:text-white rounded-xl flex items-center justify-center mb-4 transition-colors duration-300 shadow-sm ${!isCompleted && "group-hover:bg-[#00A8E8] group-hover:text-white"}`}
                        >
                          <FiMapPin size={24} />
                        </div>
                        <h4 className="text-base font-bold text-[#1C1E21] dark:text-white mb-4 leading-snug line-clamp-2">
                          {inst.name}
                        </h4>
                      </div>
                      <div className="relative z-10 mt-auto">
                        <button
                          disabled={selecting || isCompleted}
                          onClick={() =>
                            !isCompleted && handleLinkInstitution(inst._id)
                          }
                          className={`w-full py-2.5 text-sm font-bold rounded-lg transition-all border border-transparent dark:border-white/10 ${
                            isCompleted
                              ? "bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                              : "bg-[#F8F9FA] dark:bg-[#00171F]/50 text-[#1C1E21] dark:text-white/80 hover:bg-[#00A8E8] dark:hover:bg-[#00A8E8] hover:text-white dark:hover:text-white disabled:opacity-50"
                          }`}
                        >
                          {isCompleted ? (
                            "Already Given Test"
                          ) : selecting ? (
                            <span className="flex items-center justify-center gap-2">
                              <FiLoader className="animate-spin" /> ...
                            </span>
                          ) : (
                            "Connect"
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {status?.institutionId &&
            !status?.assigned &&
            !isTailoring &&
            !loadingBatches && (
              <div className="max-w-6xl mx-auto mt-12 mb-12 animate-fade-in-up">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#00A8E8]/10 to-[#007EA7]/10 dark:from-white/10 dark:to-white/5 text-[#00A8E8] dark:text-white rounded-2xl flex items-center justify-center shadow-inner border border-[#00A8E8]/20 dark:border-white/10 shrink-0">
                    <FiUsers size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <h3 className="text-2xl font-black text-[#1C1E21] dark:text-white tracking-tight">
                          Select Your Batch
                        </h3>
                        <p className="text-sm text-[#4B5563] dark:text-white/60 font-medium mt-1">
                          Join a predefined batch to generate your assessment.
                        </p>
                      </div>

                      {status?.institutionId && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl text-emerald-700 dark:text-emerald-400 shrink-0">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span className="font-bold text-sm tracking-wide">
                            Connected to:{" "}
                            <span className="text-emerald-800 dark:text-emerald-300">
                              {status?.institutionName || "Your Campus"}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {availableBatches.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availableBatches.map((batch) => (
                      <div
                        key={batch.batchId}
                        className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-6 rounded-[2rem] shadow-soft hover:shadow-soft-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col"
                      >
                        <div className="mb-4">
                          <span className="inline-block px-3 py-1 bg-[#00A8E8]/10 text-[#00A8E8] text-xs font-bold rounded-lg mb-3">
                            {batch.educationLevel}
                          </span>
                          <h4 className="text-xl font-bold text-[#1C1E21] dark:text-white leading-snug mb-2">
                            {batch.name}
                          </h4>
                          <p className="text-sm text-[#4B5563] dark:text-white/70 font-medium">
                            Domain:{" "}
                            <span className="font-bold text-[#1C1E21] dark:text-white">
                              {batch.targetDomain}
                            </span>
                          </p>
                        </div>
                        <div className="mt-auto pt-6">
                          <button
                            disabled={autopilotLoading}
                            onClick={() =>
                              handleJoinPredefinedBatch(batch.batchId)
                            }
                            className="w-full py-3 text-sm bg-[#F8F9FA] dark:bg-[#00171F]/50 text-[#1C1E21] dark:text-white/80 font-bold rounded-xl hover:bg-[#00A8E8] dark:hover:bg-[#00A8E8] hover:text-white dark:hover:text-white transition-all disabled:opacity-50 border border-transparent dark:border-white/10 flex items-center justify-center gap-2"
                          >
                            {autopilotLoading ? (
                              <>
                                <FiLoader className="animate-spin" /> Joining...
                              </>
                            ) : (
                              <>
                                <FiArrowRight /> Join Batch
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-10 bg-white/50 dark:bg-white/5 rounded-[2rem] border border-black/5 dark:border-white/10 text-center">
                    <FiAlertCircle
                      className="mx-auto text-[#4B5563] dark:text-white/50 mb-3"
                      size={32}
                    />
                    <p className="text-[#1C1E21] dark:text-white font-bold text-lg">
                      No batches available
                    </p>
                    <p className="text-sm text-[#4B5563] dark:text-white/60 mt-1">
                      Please ask your institution administrator to set up
                      batches.
                    </p>
                  </div>
                )}
              </div>
            )}

          {status?.institutionId && status?.stream && (
            <div className="max-w-5xl mx-auto mt-12">
              {!status.assigned || isTailoring ? (
                <div className="bg-white/90 dark:bg-[#00171F]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[2.5rem] p-12 text-center relative overflow-hidden shadow-soft-2xl">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#00A8E8] via-[#007EA7] to-[#00A8E8] animate-gradient-shift"></div>
                  <div className="w-28 h-28 bg-gradient-to-br from-[#00A8E8]/10 to-[#007EA7]/10 dark:from-white/10 dark:to-white/5 text-[#00A8E8] dark:text-white rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse shadow-inner border border-[#00A8E8]/20 dark:border-white/10">
                    <FiClock size={56} />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-display font-black text-[#1C1E21] dark:text-white mb-4 tracking-tight drop-shadow-sm">
                    AI is crafting your path...
                  </h3>
                  <p className="text-xl text-[#4B5563] dark:text-white/70 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
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
                  <div className="inline-flex items-center gap-4 px-8 py-4 bg-[#F8F9FA] dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/10 text-base font-bold text-[#4B5563] dark:text-white/70 mb-10 shadow-sm">
                    <FiLoader
                      className="animate-spin text-[#00A8E8] dark:text-white"
                      size={24}
                    />
                    Generating personalized assessment architecture...
                  </div>
                  <div className="flex justify-center mt-2">
                    <button
                      className="flex items-center gap-2 px-8 py-3 text-[#4B5563] dark:text-white/50 hover:text-[#1C1E21] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-all font-bold text-base"
                      onClick={() => loadDashboard(false)}
                    >
                      <FiRefreshCw size={18} /> Refresh Status
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-[#00171F] to-[#003459] rounded-[2.5rem] p-5 md:p-10 text-white shadow-2xl shadow-[#003459]/30 relative overflow-hidden group border border-[#00A8E8]/20 transition-transform duration-500">
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00A8E8]/20 rounded-full translate-x-1/3 -translate-y-1/3 blur-[100px] pointer-events-none group-hover:bg-[#00A8E8]/30 transition-colors duration-700"></div>
                  <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#00A8E8]/10 rounded-full -translate-x-1/3 translate-y-1/3 blur-[80px] pointer-events-none"></div>

                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-12">
                    <div className="flex-1">
                      <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00A8E8]/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-[#00A8E8]/40 shadow-lg text-[#00A8E8]">
                        <FiCheckCircle size={18} /> Assessment Ready
                      </div>
                      <h3 className="text-2xl md:text-4xl font-display font-black mb-6 tracking-tight text-white leading-tight">
                        {status.stream} <br />{" "}
                        <span className="text-white/50 text-xl md:text-2xl font-extrabold">
                          Bridge Path
                        </span>
                      </h3>
                      <p className="text-white/70 text-md max-w-xl leading-relaxed font-medium">
                        Your personalized assessment architecture for the{" "}
                        <span className="text-white font-bold">
                          {status.educationLevel}
                        </span>{" "}
                        level has been generated and is ready to deploy.
                      </p>
                    </div>

                    <div className="mt-8 md:mt-0 flex-shrink-0">
                      <button
                        className="px-8 py-4 bg-[#00A8E8] text-white font-black text-lg rounded-2xl shadow-[0_0_40px_rgba(0,168,232,0.4)] hover:shadow-[0_0_60px_rgba(0,168,232,0.6)] hover:bg-[#00B4F5] hover:scale-105 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-4 group/btn"
                        onClick={() => navigate("/assessment")}
                      >
                        Start Assessment
                        <FiArrowRight
                          size={28}
                          className="group-hover/btn:translate-x-2 transition-transform"
                        />
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

export default Campus;
