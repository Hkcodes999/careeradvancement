import { useEffect, useRef, useState } from "react";
import { fetchAssessment } from "../../services/studentApi";
import { submitAssessment } from "../../services/resultApi";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FiClock,
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiHelpCircle,
} from "react-icons/fi";
import GlobalLoader from "../../components/GlobalLoader";

// Persistence Keys
const BATCH_ID_KEY = "assessment_active_batch_id";
const TIMER_KEY = "assessment_start_time";
const DURATION_KEY = "assessment_total_duration";
const ANSWERS_KEY = "assessment_answers";
const VISITED_KEY = "assessment_visited";
const CURRENT_Q_KEY = "assessment_current_q";

const Assessment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const assessmentType = searchParams.get("type") || "campus";

  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [visited, setVisited] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const autoSubmitRef = useRef(false);

  /* ================= 1. LOAD DATA & VALIDATE SESSION ================= */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchAssessment({ type: assessmentType });

        if (res.locked) {
          toast.info(res.reason || "Access restricted");
          navigate("/dashboard");
          return;
        }

        const timePerQ = res.timePerQuestion || 60;
        const questionCount = res.assessment.questions.length;
        const totalSeconds = res.totalDuration || questionCount * timePerQ;

        setAssessment(res.assessment);

        /* ===== CACHE INVALIDATION ===== */
        // If the user starts a completely new assessment (different batchId), wipe the stale cache.
        const cachedBatchId = localStorage.getItem(BATCH_ID_KEY);
        if (cachedBatchId !== res.assessment.batchId) {
          [
            TIMER_KEY,
            DURATION_KEY,
            ANSWERS_KEY,
            VISITED_KEY,
            CURRENT_Q_KEY,
          ].forEach((k) => localStorage.removeItem(k));

          localStorage.setItem(BATCH_ID_KEY, res.assessment.batchId);
        }

        /* ===== RESTORE PROGRESS ===== */
        const cachedAnswers = JSON.parse(localStorage.getItem(ANSWERS_KEY));
        setAnswers(
          Array.isArray(cachedAnswers) && cachedAnswers.length === questionCount
            ? cachedAnswers
            : new Array(questionCount).fill(null),
        );

        const cachedVisited = JSON.parse(localStorage.getItem(VISITED_KEY));
        setVisited(
          Array.isArray(cachedVisited) && cachedVisited.length === questionCount
            ? cachedVisited
            : new Array(questionCount).fill(false),
        );

        setCurrentQ(Number(localStorage.getItem(CURRENT_Q_KEY)) || 0);

        /* ===== TIMER LOGIC ===== */
        const now = Date.now();
        const savedStart = localStorage.getItem(TIMER_KEY);
        const savedDuration = localStorage.getItem(DURATION_KEY);

        let startTime, remaining;
        if (savedStart && savedDuration) {
          startTime = Number(savedStart);
          remaining =
            Number(savedDuration) - Math.floor((now - startTime) / 1000);
        } else {
          startTime = now;
          remaining = totalSeconds;
          localStorage.setItem(TIMER_KEY, startTime.toString());
          localStorage.setItem(DURATION_KEY, totalSeconds.toString());
        }

        if (remaining <= 0) {
          toast.info("Time expired.");
          submit(true);
          return;
        }

        startTimeRef.current = startTime;
        setTimeLeft(remaining);
      } catch (err) {
        toast.error("Error accessing assessment environment");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => timerRef.current && clearInterval(timerRef.current);
  }, []);

  /* ================= 2. TIMER & SYNC ================= */
  useEffect(() => {
    if (!assessment || submitted) return;
    timerRef.current = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [assessment, submitted]);

  useEffect(() => {
    if (timeLeft <= 0 && assessment && !submitted && !autoSubmitRef.current) {
      autoSubmitRef.current = true;
      submit(true);
    }
  }, [timeLeft, assessment, submitted]);

  useEffect(() => {
    if (!assessment) return;
    setVisited((prev) => {
      const updated = [...prev];
      updated[currentQ] = true;
      localStorage.setItem(VISITED_KEY, JSON.stringify(updated));
      return updated;
    });
    localStorage.setItem(CURRENT_Q_KEY, currentQ.toString());
  }, [currentQ, assessment]);

  const handleSelect = (option) => {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[currentQ] = option;
      localStorage.setItem(ANSWERS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  /* ================= 3. SUBMIT HANDLER ================= */
  const submit = async (isAuto = false) => {
    if (autoSubmitRef.current || submitted) return;
    autoSubmitRef.current = true; // Block subsequent synchronous/asynchronous triggers instantly

    try {
      setSubmitted(true);
      if (timerRef.current) clearInterval(timerRef.current);

      const timeSpent = Math.floor(
        (Date.now() - (startTimeRef.current || Date.now())) / 1000,
      );

      await submitAssessment({
        answers,
        timeSpent,
        type: assessmentType,
      });

      // Cleanup
      [
        BATCH_ID_KEY,
        TIMER_KEY,
        DURATION_KEY,
        ANSWERS_KEY,
        VISITED_KEY,
        CURRENT_Q_KEY,
      ].forEach((k) => localStorage.removeItem(k));

      toast.success("Assessment submitted successfully");
      navigate("/results");
    } catch (err) {
      toast.error(err.message || "Submission failed");
      setSubmitted(false);
      autoSubmitRef.current = false;
    }
  };

  if (loading) return <GlobalLoader />;

  if (!assessment) return null;

  const question = assessment.questions[currentQ];

  // Helper for Palette Styling
  const getPaletteColor = (i) => {
    if (i === currentQ)
      return "bg-primary text-white scale-110 z-10 shadow-lg shadow-primary/30 ring-2 ring-primary/50 border-transparent";
    if (answers[i] !== null && answers[i] !== undefined)
      return "bg-emerald-500 text-white border-transparent shadow-sm";
    if (visited[i])
      return "bg-orange-400 text-white border-transparent shadow-sm";
    return "bg-white dark:bg-[#002230] text-gray-500 dark:text-gray-300 border-gray-200 dark:border-white/20 hover:border-gray-300 dark:hover:border-white/40";
  };

  return (
    <div className="h-screen bg-surface dark:bg-[#000E14] pt-4 font-sans flex flex-col overflow-hidden transition-colors duration-300">
      <div className="flex-1 flex flex-col max-w-8xl mx-auto w-full px-4 sm:px-6 lg:px-8 h-full min-h-0 pb-4">
        {/* HEADER (Fixed) */}
        <header className="flex-none flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4 pt-4">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-1 p-2 bg-white dark:bg-[#002230] text-gray-500 hover:text-primary hover:bg-gray-50 dark:hover:bg-[#003459] rounded-xl shadow-sm border border-gray-200 dark:border-white/20 transition-all flex items-center justify-center group"
              title="Exit Assessment"
            >
              <FiChevronLeft className="text-2xl group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-3xl font-display font-black text-text-main dark:text-white">
                AI-Managed Assessment
              </h1>
              <p className="text-gray-600 dark:text-gray-400 font-medium mt-1 flex items-center gap-2">
                Batch ID:
                <span className="text-primary font-mono bg-primary/10 dark:bg-primary/20 px-2 py-0.5 rounded text-sm">
                  {assessment.batchId || "Active Session"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white dark:bg-[#001A26] backdrop-blur-md px-5 py-3 rounded-xl shadow-soft-xl border border-gray-200 dark:border-white/10 transition-colors duration-300">
            <FiClock className="text-xl text-primary" />
            <span
              className={`font-mono text-xl font-bold ${
                timeLeft < 60
                  ? "text-red-500 animate-pulse"
                  : "text-text-main dark:text-gray-100"
              }`}
            >
              {Math.floor(timeLeft / 60)}:
              {(timeLeft % 60).toString().padStart(2, "0")}
            </span>
          </div>
        </header>

        {/* MAIN GRID (Fills remaining space) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-0">
          {/* LEFT: QUESTION AREA (Scrollable internal) */}
          <div className="lg:col-span-4 flex flex-col h-full min-h-0">
            <div className="flex-1 flex flex-col overflow-hidden relative p-0 bg-white dark:bg-[#00171F] border border-gray-200 dark:border-white/10 shadow-lg dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-2xl transition-colors duration-300">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-primary/50 to-primary z-20"></div>

              {/* Scrollable Question Content */}
              <div className="flex-1 overflow-hidden p-6 md:p-8 custom-scrollbar">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Question {currentQ + 1} of {assessment.questions.length}
                  </span>
                  <span className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-primary/20 dark:border-primary/30">
                    {question.category}
                  </span>
                </div>

                <h2 className="text-xl md:text-2xl font-bold text-text-main dark:text-white leading-relaxed mb-4">
                  {question.question}
                </h2>

                <div className="space-y-4">
                  {question.options.map((opt, idx) => (
                    <label
                      key={idx}
                      className={`
                        flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 group
                        ${
                          answers[currentQ] === opt
                            ? "border-primary bg-primary/5 dark:bg-[#003459]/50 shadow-md transform scale-[1.01] dark:border-primary/80"
                            : "border-gray-100 dark:border-white/10 bg-white dark:bg-[#002230] hover:bg-gray-50 dark:hover:bg-[#002B3D] hover:border-primary/50 dark:hover:border-white/30"
                        }
                      `}
                    >
                      <div className="relative flex items-center justify-center">
                        <input
                          type="radio"
                          name="answer"
                          checked={answers[currentQ] === opt}
                          onChange={() => handleSelect(opt)}
                          className="peer sr-only"
                        />
                        <div
                          className={`
                          w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300
                          ${
                            answers[currentQ] === opt
                              ? "border-primary bg-primary scale-110"
                              : "border-gray-300 dark:border-gray-500 group-hover:border-primary/50"
                          }
                        `}
                        >
                          {answers[currentQ] === opt && (
                            <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce" />
                          )}
                        </div>
                      </div>

                      <div className="flex-1">
                        <span
                          className={`font-bold mr-4 text-lg ${
                            answers[currentQ] === opt
                              ? "text-primary"
                              : "text-gray-400 dark:text-gray-500"
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span
                          className={`font-medium text-lg leading-relaxed ${
                            answers[currentQ] === opt
                              ? "text-text-main dark:text-white"
                              : "text-gray-600 dark:text-gray-300"
                          }`}
                        >
                          {opt}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Fixed Navigation Footer */}
              <div className="flex-none p-3 border-t border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-[#00111A] z-10 flex justify-between items-center gap-4 transition-colors duration-300">
                <button
                  onClick={() => setCurrentQ((q) => q - 1)}
                  disabled={currentQ === 0}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 dark:bg-[#002B3D] dark:text-gray-300 dark:hover:bg-[#003459] dark:hover:text-white dark:border dark:border-white/10"
                >
                  <FiChevronLeft /> Previous
                </button>

                {currentQ < assessment.questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQ((q) => q + 1)}
                    className="btn-primary px-4 py-2 flex items-center gap-2 shadow-lg hover:shadow-primary/30 dark:hover:shadow-primary/20"
                  >
                    Next <FiChevronRight />
                  </button>
                ) : (
                  <button
                    onClick={() => submit(false)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-emerald-500/30 hover:scale-105 flex items-center gap-2"
                  >
                    <FiCheckCircle /> Final Submit
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: PALETTE SIDEBAR (Scrollable internal) */}
          <div className="lg:col-span-1 h-full min-h-0 hidden lg:block">
            <div className="h-full flex flex-col overflow-hidden p-0 bg-white dark:bg-[#00171F] border border-gray-200 dark:border-white/10 shadow-lg dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-2xl transition-colors duration-300">
              <div className="flex-none p-5 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-[#00111A]">
                <h3 className="font-bold text-text-main dark:text-white flex items-center gap-2">
                  <FiHelpCircle className="text-primary" /> Question Palette
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                <div className="grid grid-cols-5 gap-3">
                  {assessment.questions.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentQ(i)}
                      className={`
                        w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold border transition-all duration-300 hover:scale-105 active:scale-95
                        ${getPaletteColor(i)}
                      `}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-none p-6 border-t border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-[#00111A] transition-colors duration-300">
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                  Status Legend
                </h4>
                <div className="grid grid-cols-2 gap-4 text-xs font-bold text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-sm border border-emerald-600"></span>
                    Answered
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-orange-400 shadow-sm border border-orange-500"></span>
                    Visited
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-white dark:bg-[#002230] border-2 border-gray-300 dark:border-white/20"></span>
                    Not Visited
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-primary shadow-sm border border-primary"></span>
                    Current
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assessment;
