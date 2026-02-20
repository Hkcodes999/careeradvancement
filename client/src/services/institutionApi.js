const API_BASE = `${import.meta.env.VITE_API_URL}/institution`;

/* ===============================
   Auth token helper
================================ */
const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

/* =====================================================
   ADMIN – Get logged-in admin institution
   GET /api/institution/my
===================================================== */
export const getMyInstitution = async () => {
  const token = getToken();
  if (!token) throw new Error("No authentication token found");

  const res = await fetch(`${API_BASE}/my`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to fetch institution profile");
  }

  return res.json();
};

/* =====================================================
   ADMIN – Create institution
   POST /api/institution/create
===================================================== */
export const createInstitution = async (payload) => {
  const res = await fetch(`${API_BASE}/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to create institution");
  }

  return res.json();
};

/* =====================================================
   ADMIN – Update institution
   PUT /api/institution/update/:id
===================================================== */
export const updateInstitution = async (id, payload) => {
  const res = await fetch(`${API_BASE}/update/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to update institution");
  }

  return res.json();
};

/* =====================================================
   STUDENT – Fetch active institutions
   GET /api/institution/active
===================================================== */
export const fetchInstitutions = async () => {
  const res = await fetch(`${API_BASE}/active`);

  if (!res.ok) {
    throw new Error("Failed to fetch institutions");
  }

  return res.json();
};

/* =====================================================
   STUDENT – Select institution & Domain
   Updated to pass 'stream' for AI Autopilot context
===================================================== */
export const selectInstitution = async (institutionId, stream) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/student/select-institution`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`,
      },
      // Now sending both IDs to ensure batching logic has context
      body: JSON.stringify({ institutionId, stream }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to select institution and domain");
  }

  return res.json();
};