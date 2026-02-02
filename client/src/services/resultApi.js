const API_BASE = "http://localhost:5000/api/results";

const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

/* ===============================
    Submit assessment answers
================================ */
export const submitAssessment = async ({ answers, timeSpent, targetDomain, educationLevel }) => {
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