import { useEffect, useRef, useState } from "react";
import { fetchAssessment } from "../../services/studentApi";
import { submitAssessment } from "../../services/resultApi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  FiClock,
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiHelpCircle,
} from "react-icons/fi";

// Persistence Keys
const TIMER_KEY = "assessment_start_time";
const DURATION_KEY = "assessment_total_duration";
const ANSWERS_KEY = "assessment_answers";
const VISITED_KEY = "assessment_visited";
const CURRENT_Q_KEY = "assessment_current_q";

const Assessment = () => {
  const navigate = useNavigate();

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
        const res = await fetchAssessment();

        if (res.locked) {
          toast.info(res.reason || "Access restricted");
          navigate("/dashboard");
          return;
        }

        const timePerQ = res.timePerQuestion || 60;
        const questionCount = res.assessment.questions.length;
        const totalSeconds = res.totalDuration || questionCount * timePerQ;

        setAssessment(res.assessment);

        /* ===== RESTORE PROGRESS ===== */
        setAnswers(
          JSON.parse(localStorage.getItem(ANSWERS_KEY)) ||
            new Array(questionCount).fill(null),
        );
        setVisited(
          JSON.parse(localStorage.getItem(VISITED_KEY)) ||
            new Array(questionCount).fill(false),
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
    if (submitted) return;
    try {
      setSubmitted(true);
      if (timerRef.current) clearInterval(timerRef.current);

      const timeSpent = Math.floor(
        (Date.now() - (startTimeRef.current || Date.now())) / 1000,
      );

      await submitAssessment({
        answers,
        timeSpent,
      });

      // Cleanup
      [
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

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-light">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-seaside-300 border-t-primary rounded-full animate-spin mb-4"></div>
          <p className="text-primary font-medium animate-pulse">
            Loading Assessment...
          </p>
        </div>
      </div>
    );

  if (!assessment) return null;

  const question = assessment.questions[currentQ];

  // Helper for Palette Styling
  const getPaletteColor = (i) => {
    if (i === currentQ)
      return "bg-[#00A8E8] text-white scale-110 z-10 shadow-lg shadow-[#00A8E8]/30 ring-2 ring-[#00A8E8]/30 border-transparent";
    if (answers[i] !== null && answers[i] !== undefined)
      return "bg-emerald-500 text-white border-transparent shadow-sm";
    if (visited[i])
      return "bg-orange-400 text-white border-transparent shadow-sm";
    return "bg-white text-gray-500 border-gray-200 hover:border-gray-300";
  };

  return (
    <div className="h-screen bg-bg-light pt-4 font-sans flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 h-full min-h-0 pb-4">
        {/* HEADER (Fixed) */}
        <header className="flex-none flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4 pt-4">
          <div>
            <h1 className="text-3xl font-display font-black text-primary-dark">
              AI-Managed Assessment
            </h1>
            <p className="text-text-muted font-medium mt-1 flex items-center gap-2">
              Batch ID:
              <span className="text-primary font-mono bg-seaside-100 px-2 py-0.5 rounded text-sm">
                {assessment.batchId || "Active Session"}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow-soft-xl border border-seaside-100">
            <FiClock className="text-xl text-primary" />
            <span
              className={`font-mono text-xl font-bold ${
                timeLeft < 60
                  ? "text-accent-coral animate-pulse"
                  : "text-primary-dark"
              }`}
            >
              {Math.floor(timeLeft / 60)}:
              {(timeLeft % 60).toString().padStart(2, "0")}
            </span>
          </div>
        </header>

        {/* MAIN GRID (Fills remaining space) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
          {/* LEFT: QUESTION AREA (Scrollable internal) */}
          <div className="lg:col-span-3 flex flex-col h-full min-h-0">
            <div className="card flex-1 flex flex-col overflow-hidden relative p-0 bg-white border border-secondary/20 shadow-sm rounded-2xl">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-seaside-400 to-primary z-20"></div>

              {/* Scrollable Question Content */}
              <div className="flex-1 overflow-y-auto p-6 md:p-6 custom-scrollbar">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm font-bold text-text-light uppercase tracking-wider">
                    Question {currentQ + 1} of {assessment.questions.length}
                  </span>
                  <span className="bg-seaside-100 text-primary-dark text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    {question.category}
                  </span>
                </div>

                <h2 className="text-xl md:text-2xl font-bold text-primary-dark leading-relaxed mb-5">
                  {question.question}
                </h2>

                <div className="space-y-4">
                  {question.options.map((opt, idx) => (
                    <label
                      key={idx}
                      className={`
                        flex items-center gap-4 p-3 rounded-xl border-2 cursor-pointer transition-all duration-300 group
                        ${
                          answers[currentQ] === opt
                            ? "border-primary bg-seaside-50/50 shadow-md transform scale-[1.01]"
                            : "border-seaside-100 bg-white hover:bg-seaside-50 hover:border-seaside-300"
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
                              : "border-seaside-200 group-hover:border-primary/50"
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
                          className={`font-bold mr-3 ${
                            answers[currentQ] === opt
                              ? "text-primary"
                              : "text-text-light"
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span
                          className={`font-medium text-lg ${
                            answers[currentQ] === opt
                              ? "text-primary-dark"
                              : "text-text-muted"
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
              <div className="flex-none p-4 border-t border-secondary/10 bg-white z-10 flex justify-between items-center gap-4">
                <button
                  onClick={() => setCurrentQ((q) => q - 1)}
                  disabled={currentQ === 0}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2.5"
                >
                  <FiChevronLeft /> Previous
                </button>

                {currentQ < assessment.questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQ((q) => q + 1)}
                    className="btn-primary px-6 py-2.5"
                  >
                    Next <FiChevronRight />
                  </button>
                ) : (
                  <button
                    onClick={() => submit(false)}
                    className="bg-accent-ocean text-white bg-sky-600  font-bold py-2.5 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
                  >
                    <FiCheckCircle /> Final Submit
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: PALETTE SIDEBAR (Scrollable internal) */}
          <div className="lg:col-span-1 h-full min-h-0 hidden lg:block">
            <div className="card h-full flex flex-col overflow-hidden p-0 bg-white border border-secondary/20 shadow-sm rounded-2xl">
              <div className="flex-none p-4 border-b border-seaside-100">
                <h3 className="font-bold text-primary-dark flex items-center gap-2">
                  <FiHelpCircle className="text-primary" /> Question Palette
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="grid grid-cols-5 gap-2">
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

              <div className="flex-none p-5 border-t border-gray-100 bg-white">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Status Legend
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-sm border border-emerald-600"></span>
                    Answered
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-orange-400 shadow-sm border border-orange-500"></span>
                    Visited
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-white border-2 border-gray-300"></span>
                    Not Visited
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#00A8E8] shadow-sm border border-[#00A8E8]"></span>
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
