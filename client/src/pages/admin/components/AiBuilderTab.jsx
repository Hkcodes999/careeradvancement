import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { 
  FiZap, FiSettings, FiFilePlus, FiUsers, 
  FiCpu, FiClock, FiBarChart, FiCalendar, FiShield, FiCheckCircle 
} from "react-icons/fi"; 
import { IoDocumentTextOutline } from "react-icons/io5";
import { fetchBatches } from "../../../services/batchApi";
import { generateAssessment } from "../../../services/aiApi";
import LoadingSpinner from "../../common/LoadingSpinner"; 

const AiBuilderTab = ({ institution, currentUser }) => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // --- 1️⃣ AUTOPILOT STATE (Persistent Policy) ---
  const [autopilot, setAutopilot] = useState(false);
  const [autoBatchLimit, setAutoBatchLimit] = useState(500);
  const [autoTimeLimit, setAutoTimeLimit] = useState(60); 
  const [autoQuestionsPerCategory, setAutoQuestionsPerCategory] = useState(10);
  const [autoPrompt, setAutoPrompt] = useState("");
  const [autoSyllabus, setAutoSyllabus] = useState(null);

  // --- 2️⃣ MANUAL STATE (Existing Logic Preserved) ---
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [aiEducationLevel, setAiEducationLevel] = useState("");
  const [manualSyllabus, setManualSyllabus] = useState(null);
  const [targetClassName, setTargetClassName] = useState("");
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");
  const [questionCount, setQuestionCount] = useState(10);
  const [categories, setCategories] = useState({
    logical: true, technical: false, communication: false, problemSolving: false,
  });
  const [difficulty, setDifficulty] = useState("medium");
  const [timePerQuestion, setTimePerQuestion] = useState(60);
  const [customPrompt, setCustomPrompt] = useState("");

  const categoryMap = {
    "10th": ["logical", "problemSolving"],
    "12th": ["logical", "problemSolving"],
    "Diploma": ["logical", "technical"],
    "UG": ["logical", "technical", "problemSolving"],
    "PG": ["technical", "communication", "problemSolving"],
  };

  /* ================= EFFECT: DATA FETCHING & RESTORATION ================= */
  useEffect(() => {
    // 1. Fetch batches for Manual selection
    fetchBatches().then((res) => setBatches(res.batches || []));

    // 2. Restore Persistent Policy from Institution DB object
    if (institution?.autopilot) {
      setAutopilot(institution.autopilot.active || false);
      const settings = institution.autopilot.settings || {};
      if (settings.batchLimit) setAutoBatchLimit(settings.batchLimit);
      if (settings.timeLimit) setAutoTimeLimit(settings.timeLimit);
      if (settings.questionsPerCategory) setAutoQuestionsPerCategory(settings.questionsPerCategory);
      if (settings.prompt) setAutoPrompt(settings.prompt);
    }
  }, [institution]);

  useEffect(() => {
    const b = batches.find((x) => String(x.batchId) === String(selectedBatchId));
    setSelectedBatch(b || null);
    if (b) {
      setTargetClassName(b.className || "");
      // Auto-set education level based on batch if available
      if (b.educationLevel) setAiEducationLevel(b.educationLevel);
    }
  }, [selectedBatchId, batches]);

  /* ================= AUTOPILOT LOGIC ================= */
  const canEnableAutopilot = autoBatchLimit > 0 && autoTimeLimit > 0 && autoQuestionsPerCategory > 0;

  const handleToggleAutopilot = async () => {
    if (!autopilot && !canEnableAutopilot) {
      return toast.error("Please fill Batch Limit, Time Limit, and Questions/Category.");
    }

    const newState = !autopilot;
    setLoading(true);
    
    try {
      const formData = new FormData();
      if (autoSyllabus) formData.append("pdf", autoSyllabus);
      
      const payload = {
        mode: "autopilot_config",
        institutionId: institution._id,
        active: newState,
        settings: {
          batchLimit: Number(autoBatchLimit),
          timeLimit: Number(autoTimeLimit),
          questionsPerCategory: Number(autoQuestionsPerCategory),
          prompt: autoPrompt,
          targetDomain: "General" 
        }
      };

      formData.append("payload", JSON.stringify(payload));
      await generateAssessment(formData); 
      
      setAutopilot(newState);
      toast.success(newState ? "AI Policy Saved & Active" : "AI Policy Deactivated");
    } catch (err) {
      toast.error("Failed to sync AI policy");
    } finally {
      setLoading(false);
    }
  };

  /* ================= MANUAL LOGIC (PRESERVED) ================= */
  const handleManualGenerate = async () => {
    if (!selectedBatch || !aiEducationLevel) return toast.error("Select Batch and Level");
    setLoading(true);
    try {
      const formData = new FormData();
      if (manualSyllabus) formData.append("pdf", manualSyllabus);
      
      const payload = {
        mode: "manual",
        institutionId: institution._id,
        createdBy: currentUser?.id,
        slot: { 
          date: scheduledDate, 
          startTime, 
          endTime 
        },
        config: {
          batchId: selectedBatch.batchId,
          className: targetClassName,
          educationLevel: aiEducationLevel,
          questionCount: Number(questionCount),
          categories: Object.keys(categories).filter((k) => categories[k]),
          difficulty,
          timePerQuestion: Number(timePerQuestion),
          customPrompt
        }
      };
      
      formData.append("payload", JSON.stringify(payload));
      await generateAssessment(formData);
      toast.success("Manual Assessment Generated Successfully");
    } catch (err) {
      toast.error("Manual Generation Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="builder-layout-container">
      {loading && <LoadingSpinner message={autopilot ? "Syncing AI Policy..." : "Generating Assessment..."} />}

      {/* 🚀 TOP CONTAINER: AUTOPILOT MODE (Persistent Policy) */}
      <div className={`autopilot-container-card ${autopilot ? 'is-active' : ''}`}>
        <div className="card-header">
          <div className="header-title">
            <FiZap className={`header-icon ${autopilot ? 'pulse' : ''}`} />
            <div>
              <h3>AI Autopilot Policy</h3>
              <p>Configure how AI should automatically handle incoming students.</p>
            </div>
          </div>
          <button 
            className={`autopilot-toggle-switch ${autopilot ? 'active' : ''}`}
            onClick={handleToggleAutopilot}
          >
            {autopilot ? "ACTIVE" : "ENABLE"}
          </button>
        </div>

        <div className="autopilot-form-grid">
          <div className="form-group">
            <label>Batch Size Limit</label>
            <input 
              type="number" 
              value={autoBatchLimit} 
              onChange={(e) => setAutoBatchLimit(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label>Exam Duration (Mins)</label>
            <input 
              type="number" 
              value={autoTimeLimit} 
              onChange={(e) => setAutoTimeLimit(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label>Questions per Category</label>
            <input 
              type="number" 
              value={autoQuestionsPerCategory} 
              onChange={(e) => setAutoQuestionsPerCategory(e.target.value)} 
            />
          </div>
        </div>

        <div className="autopilot-footer-row">
          <div className="form-group text-area-group">
            <label>Global AI Instructions (Rules)</label>
            <textarea 
              value={autoPrompt} 
              onChange={(e) => setAutoPrompt(e.target.value)}
              placeholder="e.g. Focus on coding questions for technical sections..."
              rows={2}
            />
          </div>
          <div className="file-upload-box">
            <label>Reference Syllabus (Global)</label>
            <div className="file-drop">
              <input type="file" onChange={(e) => setAutoSyllabus(e.target.files[0])} />
              <FiFilePlus />
              <span>{autoSyllabus ? autoSyllabus.name : "Upload Global PDF"}</span>
            </div>
          </div>
        </div>
        
        {autopilot && (
          <div className="active-status-bar">
            <FiCheckCircle /> Persistent Mode: AI is auto-generating batches based on these rules.
          </div>
        )}
      </div>

      <div className="section-divider">
        <hr /> <span>Manual Configuration</span> <hr />
      </div>

      {/* ⚙️ BOTTOM CONTAINER: MANUAL MODE (Existing Logic) */}
      <div className={`manual-container-card ${autopilot ? 'dimmed' : ''}`}>
        <div className="card-header">
          <div className="header-title">
            <FiSettings className="header-icon" />
            <h3>Manual Assessment Builder</h3>
          </div>
        </div>

        <div className="manual-form-wrapper">
          <div className="main-config-grid">
            <div className="form-group">
              <label>Education Level</label>
              <select value={aiEducationLevel} onChange={(e) => setAiEducationLevel(e.target.value)}>
                <option value="">-- Select --</option>
                {Object.keys(categoryMap).map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Total Questions</label>
              <input type="number" value={questionCount} onChange={(e) => setQuestionCount(e.target.value)} />
            </div>
          </div>

          <div className="scheduling-grid">
            <div className="form-group">
              <label><FiCalendar /> Exam Date</label>
              <input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label><FiClock /> Start Time</label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div className="form-group">
              <label><FiClock /> End Time</label>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>

          <div className="reference-section">
            <div className="form-group">
              <label>Target Batch</label>
              <select value={selectedBatchId} onChange={(e) => setSelectedBatchId(e.target.value)}>
                <option value="">-- Choose Batch --</option>
                {batches.map((b) => <option key={b.batchId} value={b.batchId}>{b.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Class Name</label>
              <input type="text" value={targetClassName} onChange={(e) => setTargetClassName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="file-label-custom">
                <input type="file" onChange={(e) => setManualSyllabus(e.target.files[0])} style={{display:'none'}} />
                <FiFilePlus /> {manualSyllabus ? manualSyllabus.name : "Upload Batch Syllabus"}
              </label>
            </div>
          </div>

          <div className="advanced-settings">
            <label>Categories (Manual Selection)</label>
            <div className="checkbox-group">
              {Object.keys(categories).map((c) => (
                <label key={c} className="checkbox">
                  <input 
                    type="checkbox" 
                    checked={categories[c]} 
                    onChange={() => setCategories({ ...categories, [c]: !categories[c] })} 
                  />
                  <span className="capitalize">{c}</span>
                </label>
              ))}
            </div>
            
            <div className="builder-grid">
              <div className="form-group">
                <label><FiBarChart /> Difficulty</label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div className="form-group">
                  <label><FiClock /> Seconds/Question</label>
                  <input type="number" value={timePerQuestion} onChange={(e) => setTimePerQuestion(e.target.value)} />
              </div>
            </div>

            <textarea 
              value={customPrompt} 
              onChange={(e) => setCustomPrompt(e.target.value)} 
              placeholder="Additional Instructions for AI..."
              rows={3}
            />
          </div>

          <button 
            className="manual-generate-btn" 
            onClick={handleManualGenerate} 
            disabled={loading || autopilot}
          >
            {loading ? "Generating..." : "Generate Manual Assessment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiBuilderTab;