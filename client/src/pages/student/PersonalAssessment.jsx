import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StudentSidebar from "../../components/StudentSidebar";
import {
  fetchStudentBatchStatus,
  setAssessmentGoal,
  cancelPersonalAssessment,
} from "../../services/studentApi";
import { runAutopilotEngine } from "../../services/aiApi";
import { toast } from "react-toastify";
import {
  FiCheckCircle,
  FiTarget,
  FiArrowRight,
  FiLoader,
  FiAlertCircle,
  FiClock,
  FiRefreshCw,
} from "react-icons/fi";
import GlobalLoader from "../../components/GlobalLoader";

/* ============================================================
   FULL-PAGE GENERATING OVERLAY
   Premium SVG neural-net animation + rotating step captions
============================================================ */
const GENERATING_STEPS = [
  "Analyzing your profile data...",
  "Mapping knowledge domains...",
  "Calibrating difficulty level...",
  "Building question architecture...",
  "Optimizing assessment coverage...",
  "Finalizing your personalized exam...",
];

const GeneratingOverlay = ({ stream }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setStepIndex((prev) => (prev + 1) % GENERATING_STEPS.length);
        setFade(true);
      }, 400);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-gradient-to-br from-[#00171F] via-[#001F2D] to-[#003459] overflow-hidden">
      {/* Ambient glow blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#00A8E8]/15 rounded-full blur-[150px] animate-pulse pointer-events-none" />
      <div
        className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] bg-[#007EA7]/15 rounded-full blur-[120px] animate-pulse pointer-events-none"
        style={{ animationDelay: "1s" }}
      />

      {/* SVG Neural Network Animation */}
      <div className="relative w-64 h-64 md:w-80 md:h-80 mb-12">
        <svg
          viewBox="0 0 300 300"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Connection lines */}
          {[
            [150, 50, 80, 150],
            [150, 50, 220, 150],
            [150, 50, 150, 160],
            [80, 150, 50, 250],
            [80, 150, 140, 250],
            [220, 150, 160, 250],
            [220, 150, 250, 250],
            [150, 160, 140, 250],
            [150, 160, 160, 250],
          ].map(([x1, y1, x2, y2], i) => (
            <line
              key={`line-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="url(#lineGrad)"
              strokeWidth="1.5"
              opacity="0.4"
            >
              <animate
                attributeName="opacity"
                values="0.2;0.7;0.2"
                dur={`${2 + (i % 3) * 0.5}s`}
                repeatCount="indefinite"
                begin={`${i * 0.3}s`}
              />
            </line>
          ))}

          {/* Traveling pulses along connections */}
          {[
            [150, 50, 80, 150],
            [150, 50, 220, 150],
            [80, 150, 140, 250],
            [220, 150, 160, 250],
          ].map(([x1, y1, x2, y2], i) => (
            <circle key={`pulse-${i}`} r="3" fill="#00A8E8" opacity="0.9">
              <animateMotion
                dur={`${1.5 + i * 0.4}s`}
                repeatCount="indefinite"
                begin={`${i * 0.6}s`}
                path={`M${x1},${y1} L${x2},${y2}`}
              />
            </circle>
          ))}

          {/* Neural nodes */}
          {[
            { cx: 150, cy: 50, r: 12, delay: 0 },
            { cx: 80, cy: 150, r: 10, delay: 0.5 },
            { cx: 220, cy: 150, r: 10, delay: 1 },
            { cx: 150, cy: 160, r: 8, delay: 1.5 },
            { cx: 50, cy: 250, r: 8, delay: 0.3 },
            { cx: 140, cy: 250, r: 8, delay: 0.8 },
            { cx: 160, cy: 250, r: 8, delay: 1.2 },
            { cx: 250, cy: 250, r: 8, delay: 0.6 },
          ].map((node, i) => (
            <g key={`node-${i}`}>
              {/* Outer glow ring */}
              <circle
                cx={node.cx}
                cy={node.cy}
                r={node.r + 8}
                fill="none"
                stroke="#00A8E8"
                strokeWidth="1"
                opacity="0.15"
              >
                <animate
                  attributeName="r"
                  values={`${node.r + 4};${node.r + 12};${node.r + 4}`}
                  dur="3s"
                  repeatCount="indefinite"
                  begin={`${node.delay}s`}
                />
                <animate
                  attributeName="opacity"
                  values="0.1;0.3;0.1"
                  dur="3s"
                  repeatCount="indefinite"
                  begin={`${node.delay}s`}
                />
              </circle>
              {/* Main node */}
              <circle
                cx={node.cx}
                cy={node.cy}
                r={node.r}
                fill="url(#nodeGrad)"
                opacity="0.9"
              >
                <animate
                  attributeName="r"
                  values={`${node.r};${node.r + 2};${node.r}`}
                  dur="2s"
                  repeatCount="indefinite"
                  begin={`${node.delay}s`}
                />
              </circle>
              {/* Inner bright core */}
              <circle
                cx={node.cx}
                cy={node.cy}
                r={node.r * 0.4}
                fill="#fff"
                opacity="0.6"
              >
                <animate
                  attributeName="opacity"
                  values="0.4;0.8;0.4"
                  dur="2s"
                  repeatCount="indefinite"
                  begin={`${node.delay}s`}
                />
              </circle>
            </g>
          ))}

          {/* Gradients */}
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00A8E8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#007EA7" stopOpacity="0.3" />
            </linearGradient>
            <radialGradient id="nodeGrad" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#00C8FF" />
              <stop offset="100%" stopColor="#007EA7" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Text content */}
      <h2 className="text-3xl md:text-4xl font-display font-black text-white mb-3 tracking-tight text-center drop-shadow-lg">
        Crafting Your Assessment
      </h2>

      {stream && (
        <p className="text-[#00A8E8] text-lg font-bold mb-8 tracking-wide uppercase">
          {stream}
        </p>
      )}

      {/* Rotating step caption */}
      <div className="h-8 flex items-center justify-center mb-10">
        <p
          className={`text-sm font-semibold tracking-widest uppercase transition-all duration-400 ${
            fade ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          {GENERATING_STEPS[stepIndex]}
        </p>
      </div>

      {/* Shimmer progress bar */}
      <div className="w-64 md:w-80 h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-transparent via-[#00A8E8] to-transparent"
          style={{
            width: "40%",
            animation: "shimmer 1.8s ease-in-out infinite",
          }}
        />
      </div>

      {/* Inline keyframes for shimmer */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-200%); }
          100% { transform: translateX(350%); }
        }
      `}</style>
    </div>
  );
};

const PersonalAssessment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);

  // Custom Flow States
  const [targetDomain, setTargetDomain] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const [expandedCategory, setExpandedCategory] = useState("Technical");

  const categorizedDomains = {
    Technical: [
      "Software Engineering",
      "Data Science",
      "Cybersecurity",
      "Cloud Computing",
      "UI/UX Design",
    ],
    Medical: [
      "Medical Sciences",
      "Healthcare Administration",
      "Nursing",
      "Biotechnology",
    ],
    Business: [
      "Financial Analysis",
      "Product Management",
      "Digital Marketing",
      "Sales & Operations",
    ],
  };

  const loadDashboard = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const res = await fetchStudentBatchStatus();
      setStatus(res);
    } catch (err) {
      toast.error("Failed to fetch assessment status.");
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleGenerateCustomAssessment = async (
    domainOverride = null,
    forcedGoalType = "none",
  ) => {
    const domainToTest = domainOverride || targetDomain;
    if (!domainToTest) return toast.error("Please enter a target domain first");

    try {
      setIsGenerating(true);
      const startTime = Date.now();

      // Save goal if this somehow came from a flow that was setting a new one
      if (!domainOverride && forcedGoalType !== "none") {
        await setAssessmentGoal(domainToTest, forcedGoalType);
      }

      // Run the autopilot engine directly with the user's custom stream
      const engineRes = await runAutopilotEngine({
        educationLevel: status?.educationLevel || "Undergraduate",
        stream: domainToTest,
        goalType: forcedGoalType,
        isPersonal: true,
      });

      console.log("[PersonalAssessment] Engine response:", engineRes);

      // Ensure the animation stays visible for at least 3 seconds
      const elapsed = Date.now() - startTime;
      if (elapsed < 3000) {
        await new Promise((r) => setTimeout(r, 3000 - elapsed));
      }

      // Fetch latest status without GlobalLoader
      await loadDashboard(false);

      console.log("[PersonalAssessment] Status after refresh:", status);

      setIsGenerating(false);
      toast.success("Assessment Ready! You can start it now.");
    } catch (err) {
      toast.error(err.message || "Failed to generate personal assessment.");
      setIsGenerating(false);
    }
  };

  const handleCancelAssessment = async () => {
    try {
      setIsCancelling(true);
      await cancelPersonalAssessment();
      setTargetDomain("");
      await loadDashboard();
      toast.success("Assessment cleared. You can now generate a new one.");
    } catch (err) {
      toast.error(err.message || "Failed to clear assessment.");
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return <GlobalLoader />;
  }

  return (
    <div className="relative flex min-h-screen bg-surface dark:bg-[#00171F] font-sans overflow-hidden">
      {/* Full-page generating overlay — rendered at top level so it always shows */}
      {isGenerating && (
        <GeneratingOverlay stream={targetDomain || status?.personalStream} />
      )}
      <div className="relative z-10 flex w-full">
        <StudentSidebar />
        <main className="flex-1 p-6 md:p-10 md:ml-72 max-w-7xl mx-auto w-full pt-[40px] md:pt-10">
          <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="animate-fade-in-up">
              <h1 className="text-2xl md:text-4xl font-display font-black text-[#1C1E21] dark:text-white tracking-tight mb-2 drop-shadow-sm">
                Personal Assessment
              </h1>
              <p className="text-sm text-[#4B5563] dark:text-white/60 font-medium">
                Generate a custom AI-driven assessment tailored exactly to your
                goals.
              </p>
            </div>
          </div>

          {!status?.profileComplete ? (
            <div className="p-8 bg-amber-50 dark:bg-amber-900/20 rounded-[2rem] border border-amber-200 dark:border-amber-800 text-center">
              <FiAlertCircle
                className="mx-auto text-amber-500 mb-4"
                size={48}
              />
              <h3 className="text-2xl font-bold text-amber-700 dark:text-amber-500 mb-2">
                Profile Incomplete
              </h3>
              <p className="text-amber-600 dark:text-amber-400 mb-6 font-medium">
                You must complete your profile first so the AI can tailor the
                questions accurately.
              </p>
              <button
                onClick={() => navigate("/profile")}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors"
              >
                Complete Profile
              </button>
            </div>
          ) : !status?.personalStream || !status?.personalAssigned ? (
            /* TARGET SELECTION UI */
            <div className="space-y-6 max-w-5xl mt-12 animate-fade-in-up">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#00A8E8]/10 to-[#007EA7]/10 dark:from-white/10 dark:to-white/5 text-[#00A8E8] dark:text-white rounded-2xl flex items-center justify-center shadow-inner border border-[#00A8E8]/20 dark:border-white/10 shrink-0">
                    <FiTarget size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-[#1C1E21] dark:text-white tracking-tight">
                      {status?.assessmentsCompleted > 0
                        ? "Ready for your next challenge?"
                        : "What are you aiming for?"}
                    </h3>
                    <p className="text-sm text-[#4B5563] dark:text-white/60 font-medium mt-1">
                      {status?.assessmentsCompleted > 0
                        ? "Select or type the next field you want to be assessed on."
                        : "Select or type the field you want to be assessed on."}
                    </p>
                  </div>
                </div>

                {status?.assessmentsCompleted > 0 && (
                  <div className="flex items-center gap-3 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 px-4 py-2 rounded-2xl shadow-sm shrink-0">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <FiCheckCircle size={16} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#4B5563] dark:text-white/50 uppercase tracking-wider block leading-none mb-1">
                        Assessments Completed
                      </span>
                      <span className="text-xl font-black text-[#1C1E21] dark:text-white leading-none block">
                        {status.assessmentsCompleted}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* DISPLAY EXISTING GOALS IF ANY */}
              {(status?.shortTermGoal || status?.longTermGoal) && (
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                  {status?.shortTermGoal && (
                    <div className="flex-1 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 dark:from-emerald-500/5 dark:to-emerald-600/5 border border-emerald-500/20 dark:border-emerald-500/10 rounded-2xl p-5 flex items-center justify-between group">
                      <div>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                          Short-Term Goal
                        </span>
                        <h4 className="text-lg font-black text-[#1C1E21] dark:text-white">
                          {status.shortTermGoal}
                        </h4>
                      </div>
                      <button
                        onClick={() =>
                          handleGenerateCustomAssessment(
                            status.shortTermGoal,
                            "shortTermGoal",
                          )
                        }
                        disabled={isGenerating}
                        className="px-5 py-2.5 bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-md hover:bg-emerald-600 transition-colors flex items-center gap-2 border border-emerald-400/50"
                      >
                        {isGenerating ? "Generating..." : "Assess Goal"}
                        <FiArrowRight
                          size={16}
                          className={
                            isGenerating ? "opacity-50" : "translate-y-[1px]"
                          }
                        />
                      </button>
                    </div>
                  )}
                  {status?.longTermGoal && (
                    <div className="flex-1 bg-gradient-to-br from-purple-500/10 to-purple-600/10 dark:from-purple-500/5 dark:to-purple-600/5 border border-purple-500/20 dark:border-purple-500/10 rounded-2xl p-5 flex items-center justify-between group">
                      <div>
                        <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block mb-1">
                          Long-Term Goal
                        </span>
                        <h4 className="text-lg font-black text-[#1C1E21] dark:text-white">
                          {status.longTermGoal}
                        </h4>
                      </div>
                      <button
                        onClick={() =>
                          handleGenerateCustomAssessment(
                            status.longTermGoal,
                            "longTermGoal",
                          )
                        }
                        disabled={isGenerating}
                        className="px-5 py-2.5 bg-purple-500 text-white text-sm font-bold rounded-xl shadow-md hover:bg-purple-600 transition-colors flex items-center gap-2 border border-purple-400/50"
                      >
                        {isGenerating ? "Generating..." : "Assess Goal"}
                        <FiArrowRight
                          size={16}
                          className={
                            isGenerating ? "opacity-50" : "translate-y-[1px]"
                          }
                        />
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-[2.5rem] p-8 shadow-soft-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#00A8E8]/5 to-transparent rounded-bl-[80px] -mr-8 -mt-8 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col gap-4">
                  <h3 className="text-2xl font-black text-[#1C1E21] dark:text-white tracking-tight mb-2 drop-shadow-sm">
                    Try Other Domains
                  </h3>
                  <div className="space-y-3 mb-6">
                    {Object.entries(categorizedDomains).map(
                      ([category, domains]) => (
                        <div
                          key={category}
                          className="border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden bg-[#F8FAFC] dark:bg-[#00171F]/50"
                        >
                          <button
                            onClick={() =>
                              setExpandedCategory(
                                expandedCategory === category ? null : category,
                              )
                            }
                            className="w-full flex items-center justify-between p-4 bg-white/50 dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                          >
                            <span className="font-bold text-[#1C1E21] dark:text-white">
                              {category} Fields
                            </span>
                            <FiTarget
                              className={`transition-transform ${
                                expandedCategory === category
                                  ? "rotate-90 text-[#00A8E8]"
                                  : "text-[#4B5563] dark:text-white/50"
                              }`}
                            />
                          </button>

                          {expandedCategory === category && (
                            <div className="p-4 flex flex-wrap gap-3 border-t border-black/5 dark:border-white/5 bg-white/30 dark:bg-transparent">
                              {domains.map((target) => (
                                <button
                                  key={target}
                                  onClick={() => setTargetDomain(target)}
                                  className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all duration-300 ${
                                    targetDomain === target
                                      ? "bg-[#00A8E8] border-[#00A8E8] text-white shadow-md shadow-[#00A8E8]/20 scale-105"
                                      : "bg-white dark:bg-black/20 text-[#1C1E21] dark:text-white/80 border-black/10 dark:border-white/10 hover:border-[#00A8E8]/30 hover:text-[#00A8E8] dark:hover:text-[#00A8E8]"
                                  }`}
                                >
                                  {target}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ),
                    )}
                  </div>

                  <div className="relative flex justify-between gap-5">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <FiTarget size={15} />
                    </div>
                    <input
                      type="text"
                      className="w-full bg-[#F8F9FA] dark:bg-[#00171F]/50 border border-black/5 dark:border-white/10 rounded-2xl pl-10 pr-2 py-2 text-[#1C1E21] dark:text-white font-bold outline-none focus:border-[#00A8E8] focus:ring-2 focus:ring-[#00A8E8]/20 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
                      placeholder="Or type a custom domain (e.g., DevOps Engineering, Game Design)..."
                      value={targetDomain}
                      onChange={(e) => setTargetDomain(e.target.value)}
                    />
                    <button
                      onClick={() =>
                        handleGenerateCustomAssessment(null, "none")
                      }
                      disabled={!targetDomain || isGenerating}
                      className="px-10 py-4 bg-gradient-to-r from-[#00A8E8] to-[#007EA7] text-white font-black text-base rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:grayscale disabled:hover:scale-100 flex items-center gap-3"
                    >
                      {isGenerating ? (
                        <span className="flex items-center gap-2 shrink-0 whitespace-nowrap">
                          <FiLoader className="animate-spin" /> Igniting AI
                          Engine...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 shrink-0 whitespace-nowrap">
                          Generate Exam <FiArrowRight />
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ACTIVE ASSESSMENT — READY */
            <div className="max-w-5xl mx-auto mt-12">
              {
                <div className="bg-gradient-to-br from-[#00171F] to-[#003459] rounded-[2.5rem] p-5 md:p-10 text-white shadow-2xl shadow-[#003459]/30 relative overflow-hidden group border border-[#00A8E8]/20 transition-transform duration-500">
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00A8E8]/20 rounded-full translate-x-1/3 -translate-y-1/3 blur-[100px] pointer-events-none group-hover:bg-[#00A8E8]/30 transition-colors duration-700"></div>
                  <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#00A8E8]/10 rounded-full -translate-x-1/3 translate-y-1/3 blur-[80px] pointer-events-none"></div>

                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-12">
                    <div className="flex-1">
                      <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00A8E8]/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-[#00A8E8]/40 shadow-lg text-[#00A8E8]">
                        <FiCheckCircle size={18} /> Assessment Ready
                      </div>
                      <h3 className="text-2xl md:text-4xl font-display font-black mb-6 tracking-tight text-white leading-tight">
                        {status.personalStream} <br />{" "}
                        <span className="text-white/50 text-xl md:text-2xl font-extrabold">
                          Personal Path
                        </span>
                      </h3>
                      <p className="text-white/70 text-md max-w-xl leading-relaxed font-medium">
                        Your personalized independent assessment architecture
                        for the{" "}
                        <span className="text-white font-bold">
                          {status.educationLevel}
                        </span>{" "}
                        level has been generated.
                      </p>
                    </div>

                    <div className="mt-8 md:mt-0 flex-shrink-0 flex flex-col items-center sm:items-end gap-3 w-full sm:w-auto">
                      <button
                        className="w-full sm:w-auto px-8 py-4 bg-[#00A8E8] text-white font-black text-lg rounded-2xl shadow-[0_0_40px_rgba(0,168,232,0.4)] hover:shadow-[0_0_60px_rgba(0,168,232,0.6)] hover:bg-[#00B4F5] hover:scale-105 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-4 group/btn"
                        onClick={() => navigate("/assessment?type=personal")}
                      >
                        Start Assessment
                        <FiArrowRight
                          size={28}
                          className="group-hover/btn:translate-x-2 transition-transform"
                        />
                      </button>

                      <button
                        className="w-full sm:w-auto px-6 py-2.5 bg-white/10 text-white/80 hover:text-white hover:bg-[#ef4444]/80 font-bold text-sm rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-white/20 hover:border-transparent hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] disabled:opacity-50"
                        onClick={handleCancelAssessment}
                        disabled={isCancelling}
                      >
                        {isCancelling ? (
                          <FiLoader className="animate-spin" />
                        ) : (
                          <FiRefreshCw size={14} />
                        )}
                        Start Over / Change Domain
                      </button>
                    </div>
                  </div>
                </div>
              }
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PersonalAssessment;
