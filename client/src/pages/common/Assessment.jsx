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
  FiCircle,
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
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (!assessment) return null;

  const question = assessment.questions[currentQ];

  // Helper for Palette Styling
  const getPaletteColor = (i) => {
    if (i === currentQ)
      return "bg-indigo-600 text-white ring-2 ring-indigo-300 ring-offset-2 scale-110 z-10";
    if (answers[i] !== null)
      return "bg-emerald-500 text-white border-emerald-500";
    if (visited[i]) return "bg-amber-400 text-white border-amber-400";
    return "bg-white text-slate-600 border-slate-200 hover:border-indigo-300";
  };

  return (
    <div className="min-h-screen bg-bg-light pt-20 font-sans pb-10">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              AI-Managed Assessment
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Batch ID:{" "}
              <span className="text-indigo-600 font-mono bg-indigo-50 px-2 py-0.5 rounded">
                {assessment.batchId || "Active Session"}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-lg shadow-slate-200">
            <FiClock className="text-xl text-indigo-400" />
            <span
              className={`font-mono text-xl font-bold ${timeLeft < 60 ? "text-rose-400 animate-pulse" : ""}`}
            >
              {Math.floor(timeLeft / 60)}:
              {(timeLeft % 60).toString().padStart(2, "0")}
            </span>
          </div>
        </header>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* LEFT: QUESTION AREA */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600"></div>

              <div className="flex justify-between items-start mb-6">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                  Question {currentQ + 1} of {assessment.questions.length}
                </span>
                <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  {question.category}
                </span>
              </div>

              <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-relaxed mb-8">
                {question.question}
              </h2>

              <div className="space-y-3">
                {question.options.map((opt, idx) => (
                  <label
                    key={idx}
                    className={`
                      flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group
                      ${
                        answers[currentQ] === opt
                          ? "border-indigo-600 bg-indigo-50/50 shadow-[0_0_0_1px_rgba(79,70,229,0.1)]"
                          : "border-slate-100 bg-slate-50 hover:bg-white hover:border-indigo-200 hover:shadow-sm"
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
                        w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                        ${answers[currentQ] === opt ? "border-indigo-600 bg-indigo-600" : "border-slate-300 group-hover:border-indigo-400"}
                      `}
                      >
                        {answers[currentQ] === opt && (
                          <div className="w-2.5 h-2.5 bg-white rounded-full" />
                        )}
                      </div>
                    </div>

                    <div className="flex-1">
                      <span
                        className={`font-bold mr-3 ${answers[currentQ] === opt ? "text-indigo-700" : "text-slate-400"}`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span
                        className={`font-medium ${answers[currentQ] === opt ? "text-slate-900" : "text-slate-700"}`}
                      >
                        {opt}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center gap-4">
              <button
                onClick={() => setCurrentQ((q) => q - 1)}
                disabled={currentQ === 0}
                className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <FiChevronLeft /> Previous
              </button>

              {currentQ < assessment.questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQ((q) => q + 1)}
                  className="px-6 py-3 rounded-xl font-bold text-indigo-600 bg-white border border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 transition-all flex items-center gap-2 shadow-sm"
                >
                  Next <FiChevronRight />
                </button>
              ) : (
                <button
                  onClick={() => submit(false)}
                  className="px-8 py-3 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-200 hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                >
                  <FiCheckCircle /> Final Submit
                </button>
              )}
            </div>
          </div>

          {/* RIGHT: PALETTE SIDEBAR */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FiHelpCircle className="text-indigo-500" /> Question Palette
              </h3>

              <div className="grid grid-cols-5 gap-2 mb-6">
                {assessment.questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentQ(i)}
                    className={`
                      w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold border transition-all duration-200
                      ${getPaletteColor(i)}
                    `}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <div className="space-y-3 pt-6 border-t border-slate-100 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>{" "}
                  Answered
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-amber-400"></span>{" "}
                  Visited
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-slate-200 border border-slate-300"></span>{" "}
                  Not Visited
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-indigo-600 ring-2 ring-indigo-200"></span>{" "}
                  Current
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
