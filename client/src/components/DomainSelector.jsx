import React, { useState } from "react";
import { HiOutlineBookOpen, HiOutlineBriefcase, HiOutlineArrowRight, HiOutlinePencilAlt } from "react-icons/hi";
import "./DomainSelector.css";

const DomainSelector = ({ onStart }) => {
  const [targetDomain, setTargetDomain] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [educationLevel, setEducationLevel] = useState("");

  // Dynamic domain mapping based on requirements
  const getDomainOptions = (level) => {
    switch (level) {
      case "10th":
        return ["Science (PCM)", "Science (PCB)", "Commerce", "Arts/Humanities"];
      case "12th":
        return ["Engineering (B.Tech/BE)", "Medicine (MBBS/BDS)", "Computer Applications (BCA)", "Business (BBA)", "Pure Sciences (B.Sc)", "Commerce (B.Com)"];
      case "Diploma":
      case "UG":
      case "PG":
      case "Post PG":
        return ["Computer Science & IT", "Mechanical Engineering", "Civil Engineering", "Finance & Accounting", "Data Science & AI", "Business Management", "Human Resources"];
      default:
        return [];
    }
  };

  const levels = [
    { label: "10th Grade", value: "10th" },
    { label: "12th Grade", value: "12th" },
    { label: "Diploma", value: "Diploma" },
    { label: "Undergraduate (UG)", value: "UG" },
    { label: "Postgraduate (PG)", value: "PG" },
    { label: "Post PG / Professional", value: "Post PG" }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // Use custom domain if "Other" is selected, otherwise use dropdown value
    const finalDomain = targetDomain === "Other" ? customDomain : targetDomain;
    
    if (finalDomain && educationLevel) {
      onStart({ targetDomain: finalDomain, educationLevel, isOther: targetDomain === "Other" });
    }
  };

  const currentDomains = getDomainOptions(educationLevel);

  return (
    <div className="selector-container">
      <div className="selector-card">
        <div className="selector-header">
          <HiOutlineBookOpen className="header-icon" />
          <h2>Tailor Your Assessment</h2>
          <p>Define your goal to receive a specialized evaluation.</p>
        </div>

        <form onSubmit={handleSubmit} className="selector-form">
          {/* Education Level Selection First to drive dynamic domains */}
          <div className="input-group">
            <label>
              <HiOutlineBookOpen className="label-icon" /> Education Level
            </label>
            <select 
              value={educationLevel} 
              onChange={(e) => {
                setEducationLevel(e.target.value);
                setTargetDomain(""); // Reset domain when level changes
              }}
              required
            >
              <option value="">Select your current level...</option>
              {levels.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>
              <HiOutlineBriefcase className="label-icon" /> Target Domain
            </label>
            <select 
              value={targetDomain} 
              onChange={(e) => setTargetDomain(e.target.value)}
              disabled={!educationLevel}
              required
            >
              <option value="">Choose your target field...</option>
              {currentDomains.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
              <option value="Other">Other (Type your own...)</option>
            </select>
            <small className="input-help">
              {educationLevel === "10th" ? "Select your preferred Class 12 stream." : 
               educationLevel === "12th" ? "Select your preferred UG program." : 
               "We will generate questions specific to this field."}
            </small>
          </div>

          {/* Conditional "Other" Input */}
          {targetDomain === "Other" && (
            <div className="input-group animate-fade-in">
              <label>
                <HiOutlinePencilAlt className="label-icon" /> Specify Domain
              </label>
              <input
                type="text"
                placeholder="e.g., Astrophysics, Digital Marketing..."
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                required
              />
            </div>
          )}

          <button 
            type="submit" 
            className="start-btn"
            disabled={!educationLevel || !targetDomain || (targetDomain === "Other" && !customDomain)}
          >
            Generate My Assessment <HiOutlineArrowRight />
          </button>
        </form>
      </div>
    </div>
  );
};

export default DomainSelector;