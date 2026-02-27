const API_BASE = `${import.meta.env.VITE_API_URL}/results`;

const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

/* ===============================
    Submit assessment answers
================================ */
export const submitAssessment = async ({
  answers,
  timeSpent,
  targetDomain,
  educationLevel,
}) => {
  const res = await fetch(`${API_BASE}/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    // Added targetDomain and educationLevel to the request body
    body: JSON.stringify({ answers, timeSpent, targetDomain, educationLevel }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to submit assessment");
  }

  return data;
};

/* ===============================
    Fetch logged-in student result
================================ */
export const fetchMyResult = async () => {
  const res = await fetch(`${API_BASE}/my`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch result");
  }

  return data;
};

/* ===============================
    Fetch all my results (History)
================================================ */
export const fetchAllMyResults = async () => {
  const res = await fetch(`${API_BASE}/my/all`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch results history");
  }

  return data;
};

/* ===============================
    Fetch a specific result by ID
================================================ */
export const fetchResultById = async (id) => {
  const res = await fetch(`${API_BASE}/${id}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch specific result");
  }

  return data;
};

/* ===============================
    Reset Assessment (The Fix)
================================ */
export const resetAssessment = async () => {
  const res = await fetch(`${API_BASE}/reset`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to reset assessment");
  }

  return data;
};
