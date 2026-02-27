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

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetchStudentBatchStatus();
      setStatus(res);
    } catch (err) {
      toast.error("Failed to fetch assessment status.");
    } finally {
      setLoading(false);
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

      // Save goal if this somehow came from a flow that was setting a new one
      // (Currently, custom input defaults to "none", returning false for this condition)
      if (!domainOverride && forcedGoalType !== "none") {
        await setAssessmentGoal(domainToTest, forcedGoalType);
      }

      // Run the autopilot engine directly with the user's custom stream
      await runAutopilotEngine({
        educationLevel: status?.educationLevel || "Undergraduate",
        stream: domainToTest,
        goalType: forcedGoalType,
        isPersonal: true,
      });

      // Fetch latest status which should now show an active stream and batch assignment
      await loadDashboard();
      setIsGenerating(false);
      toast.success("Assessment Generating...");
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
          ) : !status?.stream || !status?.assigned ? (
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
            /* ACTIVE ASSESSMENT WAITING OR READY */
            <div className="max-w-5xl mx-auto mt-12">
              {isGenerating ? (
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
                      onClick={() => loadDashboard()}
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
                        onClick={() => navigate("/assessment")}
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
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PersonalAssessment;
