import React, { useEffect, useRef, useState } from "react";
import { fetchAssessment } from "../../services/studentApi";
import { submitAssessment } from "../../services/resultApi";
import StudentSidebar from "../../components/StudentSidebar";
import DomainSelector from "../../components/DomainSelector.jsx"; // Import renamed .jsx file
import "./StudentDashboard.css";

const StudentAssessment = () => {
  const [step, setStep] = useState("selector"); // 'selector' or 'quiz'
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [locked, setLocked] = useState(false);
  const [config, setConfig] = useState(null); // Stores { targetDomain, educationLevel }

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // Triggered by DomainSelector
  const handleStartAssessment = async (selectedConfig) => {
    try {
      setConfig(selectedConfig);
      const res = await fetchAssessment(selectedConfig);

      if (res.locked) {
        setLocked(true);
        alert(res.reason || "Assessment unavailable.");
        if (res.reason?.includes("already completed")) {
            window.location.href = "/results";
        }
        return;
      }

      setAssessment(res.assessment);
      const totalTime = res.assessment.questions.length * (res.timePerQuestion || 60);

      setTimeLeft(totalTime);
      startTimeRef.current = Date.now();
      setStep("quiz");
    } catch (err) {
      alert("Error starting assessment: " + err.message);
    }
  };

  useEffect(() => {
    if (!timeLeft || locked || step !== "quiz") return;

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timeLeft, locked, step]);

  const handleAutoSubmit = () => {
    handleSubmit();
  };

  const handleSubmit = async () => {
    if (!window.confirm("Are you sure you want to submit?")) return;
    
    clearInterval(timerRef.current);
    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);

    try {
      await submitAssessment({
        answers: Object.values(answers), // Ensure it's an array for the backend
        timeSpent,
        targetDomain: config.targetDomain,
        educationLevel: config.educationLevel
      });

      window.location.href = "/results";
    } catch (err) {
      alert("Submission failed: " + err.message);
    }
  };

  // 1. Initial State: Domain Selection
  if (step === "selector") {
    return (
      <div className="student-layout">
        <StudentSidebar />
        <main className="student-main">
          <DomainSelector onStart={handleStartAssessment} />
        </main>
      </div>
    );
  }

  // 2. Loading State
  if (!assessment) return <div className="loading-spinner">Tailoring questions...</div>;

  // 3. Quiz State
  return (
    <div className="student-layout">
      <StudentSidebar />

      <main className="student-main">
        <div className="assessment-header">
            <div className="timer">⏱ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
            <div className="domain-badge">Target: {config.targetDomain}</div>
        </div>

        <div className="questions-list">
            {assessment.questions.map((q, i) => (
            <div key={i} className="question-card">
                <h4>
                {i + 1}. {q.question}
                </h4>

                <div className="options-grid">
                    {q.options.map((opt) => (
                    <label key={opt} className={`option-label ${answers[i] === opt ? 'selected' : ''}`}>
                        <input
                        type="radio"
                        name={`q-${i}`}
                        checked={answers[i] === opt}
                        onChange={() =>
                            setAnswers((prev) => ({ ...prev, [i]: opt }))
                        }
                        />
                        {opt}
                    </label>
                    ))}
                </div>
            </div>
            ))}
        </div>

        <div className="submit-section">
            <button className="primary-btn" onClick={handleSubmit}>
            Finish & View Fitment Analysis
            </button>
        </div>
      </main>
    </div>
  );
};

export default StudentAssessment;