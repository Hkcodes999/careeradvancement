const API_BASE = `${import.meta.env.VITE_API_URL}/student`;

/* ==================================================
    AUTH TOKEN HELPER
================================================== */
const getToken = () => {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
};

/* ==================================================
    COMMON FETCH HANDLER
================================================= */
const apiFetch = async (url, options = {}) => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication token missing. Please login again.");
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    ...(options.headers || {}),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok || (data && data.success === false)) {
    const errorMsg = data?.message || `Request failed (${res.status})`;

    if (res.status === 401) {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      window.location.href = "/login";
    }

    throw new Error(errorMsg);
  }

  return data;
};

/* ==================================================
    BIODATA PARSING
================================================== */
export const uploadAndParseBiodata = async (input) => {
  const formData = new FormData();
  if (input instanceof File) {
    formData.append("biodata", input);
  } else if (input instanceof FormData) {
    const file = input.get("biodata") || input.get("file");
    if (!file) throw new Error("No file found.");
    formData.append("biodata", file);
  } else {
    throw new Error("Invalid file format.");
  }

  return apiFetch(`${API_BASE}/parse-biodata`, {
    method: "POST",
    body: formData,
  });
};

/* ==================================================
    STUDENT PROFILE (CRUD)
================================================== */
export const fetchStudentProfile = async () => {
  return apiFetch(`${API_BASE}/profile`, { method: "GET" });
};

export const saveStudentProfile = async (profileData) => {
  return apiFetch(`${API_BASE}/profile`, {
    method: "POST",
    body: JSON.stringify(profileData),
  });
};

export const setAssessmentGoal = async (domain, goalType) => {
  return apiFetch(`${API_BASE}/set-goal`, {
    method: "POST",
    body: JSON.stringify({ domain, goalType }),
  });
};

export const cancelPersonalAssessment = async () => {
  return apiFetch(`${API_BASE}/cancel-autopilot`, { method: "POST" });
};

/* ==================================================
    BATCH & INSTITUTION LOGIC
================================================== */

/**
 * Fetches the student's current progress.
 * Ensure this returns: profileComplete, institutionId, stream (target), and assigned (boolean).
 */
export const fetchStudentBatchStatus = async () => {
  return apiFetch(`${API_BASE}/batch-status`, { method: "GET" });
};

/**
 * UPDATED: Now supports passing a target domain (stream)
 * so the backend can record the student's upgrade choice.
 */
export const selectInstitution = async (institutionId, targetStream = null) => {
  const body = { institutionId };
  if (targetStream) body.stream = targetStream;

  return apiFetch(`${API_BASE}/select-institution`, {
    method: "POST",
    body: JSON.stringify(body),
  });
};

export const joinCampus = async (institutionId, batchId = null) => {
  return apiFetch(`${API_BASE}/join-campus`, {
    method: "POST",
    body: JSON.stringify({ institutionId, batchId }),
  });
};

export const fetchAvailableBatches = async () => {
  return apiFetch(`${API_BASE}/available-batches`, { method: "GET" });
};

export const joinBatch = async (batchId) => {
  return apiFetch(`${API_BASE}/join-batch`, {
    method: "POST",
    body: JSON.stringify({ batchId }),
  });
};

/* ==================================================
    ASSESSMENT FETCHING
================================================== */
export const fetchAssessment = async (config = {}) => {
  try {
    const { targetDomain, educationLevel, type } = config;

    const queryParams = new URLSearchParams();
    if (targetDomain) queryParams.append("targetDomain", targetDomain);
    if (educationLevel) queryParams.append("educationLevel", educationLevel);
    if (type) queryParams.append("type", type);

    const url = `${API_BASE}/assessment?${queryParams.toString()}`;

    const res = await apiFetch(url, { method: "GET" });
    return res;
  } catch (err) {
    return {
      locked: true,
      reason: err.message || "Assessment unavailable",
      slot: null,
    };
  }
};
