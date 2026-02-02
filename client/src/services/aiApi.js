const API_URL = "http://localhost:5000/api/ai";

/**
 * Helper to consolidate authentication and content-type headers
 * @param {boolean} isJson - If true, sets application/json content-type
 */
const getHeaders = (isJson = true) => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };
  if (isJson) headers["Content-Type"] = "application/json";
  return headers;
};

/**
 * GENERATE AI ASSESSMENT / SAVE POLICY
 * Used by Admin to manually generate exams or save Autopilot policies.
 * @param {FormData} formData - Contains mode, payload, and optional PDF.
 */
export const generateAssessment = async (formData) => {
  const res = await fetch(`${API_URL}/generate-assessment`, {
    method: "POST",
    headers: getHeaders(false), // FormData requires boundary setting, so we skip manual Content-Type
    body: formData,
  });

  const data = await res.json();

  if (res.status === 409) {
    throw new Error("Assessment already exists for this batch. Delete the existing one first.");
  }

  if (!res.ok) {
    throw new Error(data.message || "Assessment generation failed");
  }

  return data;
};

/**
 * STUDENT TRIGGER: RUN AUTOPILOT ENGINE
 * Triggered by StudentDashboard.jsx to auto-assign batches and check readiness.
 * @param {Object} context - Optional student profile data { educationLevel, stream }
 */
export const runAutopilotEngine = async (context = {}) => {
  const res = await fetch(`${API_URL}/run-autopilot`, {
    method: "POST",
    headers: getHeaders(true),
    // Explicitly mapping keys to ensure backend receives expected fields
    body: JSON.stringify({
      educationLevel: context.educationLevel,
      stream: context.stream
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to trigger AI engine");
  }

  return data;
};

/**
 * PARSE BIODATA (RESUME PARSER)
 * @param {FormData} formData - Contains the 'resume' file.
 */
export const parseBiodata = async (formData) => {
  const res = await fetch(`${API_URL}/parse-biodata`, {
    method: "POST",
    headers: getHeaders(false), // Using FormData
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to parse resume");
  }

  return data;
};

/**
 * ROLLBACK ASSESSMENT
 * @param {string} id - The MongoDB ID of the assessment
 */
export const rollbackAssessment = async (id) => {
  const res = await fetch(`${API_URL}/rollback/${id}`, {
    method: "DELETE",
    headers: getHeaders(true),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Rollback failed");
  }

  return data;
};