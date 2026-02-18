import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  saveStudentProfile,
  fetchStudentBatchStatus,
  uploadAndParseBiodata,
} from "../../services/studentApi";
import StudentSidebar from "../../components/StudentSidebar";
import { toast } from "react-toastify";
import {
  FiUpload,
  FiEdit2,
  FiArrowLeft,
  FiSave,
  FiUser,
  FiMapPin,
  FiBookOpen,
  FiActivity,
  FiTarget,
} from "react-icons/fi";

const StudentProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // State Management
  const [loading, setLoading] = useState(true);
  const [isParsing, setIsParsing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  // Core Form Fields
  const [form, setForm] = useState({
    phone: "",
    age: "",
    gender: "",
    education: "",
    stream: "",
    personalityType: "",
    city: "",
    state: "",
    interests: "",
    skills: "",
    careerGoal: "",
  });

  // "Capture All" State for AI-extracted extra info
  const [others, setOthers] = useState({});
  const [errors, setErrors] = useState({});

  /* ================= LOAD PROFILE ================= */
  useEffect(() => {
    const getProfile = async () => {
      try {
        setLoading(true);
        const res = await fetchStudentBatchStatus();

        if (res.profileComplete && res.profile) {
          const p = res.profile;
          setForm({
            phone: p.phone || "",
            age: p.age || "",
            gender: p.gender || "",
            education: p.education || "",
            stream: p.stream || "",
            personalityType: p.personalityType || "",
            city: p.city || "",
            state: p.state || "",
            interests: p.interests || "",
            skills: Array.isArray(p.skills)
              ? p.skills.join(", ")
              : p.skills || "",
            careerGoal: p.careerGoal || "",
          });

          // Load the 'others' data if it exists in the profile
          if (p.others) {
            setOthers(p.others);
          }

          setHasProfile(true);
          setIsEditing(false);
        } else {
          setIsEditing(true);
        }
      } catch (err) {
        toast.error("Error loading profile details");
      } finally {
        setLoading(false);
      }
    };
    getProfile();
  }, []);

  const educationNeedsStream = ["12th", "UG", "PG", "Post PG"].includes(
    form.education,
  );

  /* ================= AUTO-FILL FROM BIODATA ================= */
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsParsing(true);
      toast.info("AI is analyzing your biodata... please wait");

      const res = await uploadAndParseBiodata(file);

      // Map primary fields to form
      if (res.extractedData) {
        setForm((prev) => ({
          ...prev,
          ...res.extractedData,
          skills: Array.isArray(res.extractedData.skills)
            ? res.extractedData.skills.join(", ")
            : res.extractedData.skills || prev.skills,
        }));
      }

      // Capture all extra details into 'others' state
      if (res.others) {
        setOthers(res.others);
      }

      toast.success("Profile fields auto-filled! Please review them.");
    } catch (err) {
      toast.error(err.message || "Failed to parse biodata.");
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  /* ================= VALIDATION ================= */
  const validate = () => {
    const newErrors = {};
    if (!/^[6-9]\d{9}$/.test(form.phone))
      newErrors.phone = "Enter valid 10-digit phone number";
    if (!form.age || form.age < 10 || form.age > 100)
      newErrors.age = "Enter a valid age";
    if (!form.gender) newErrors.gender = "Gender is required";
    if (!form.education) newErrors.education = "Education is required";
    if (educationNeedsStream && !form.stream?.trim())
      newErrors.stream = "Stream is required";
    if (!form.skills?.trim()) newErrors.skills = "Skills are required";
    if (!form.careerGoal?.trim())
      newErrors.careerGoal = "Career goal is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ================= SAVE PROFILE ================= */
  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const payload = {
        ...form,
        age: Number(form.age),
        gender: form.gender.toLowerCase(),
        skills:
          typeof form.skills === "string"
            ? form.skills
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : form.skills,
        others: others, // Preserve extra AI-extracted data
      };

      await saveStudentProfile(payload);

      toast.success("Profile saved successfully");
      setHasProfile(true);
      setIsEditing(false);
    } catch (err) {
      toast.error("Failed to save profile");
    }
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-surface font-sans pt-[72px]">
      <StudentSidebar />
      <main className="flex-1 p-8 md:p-10 md:ml-72 max-w-5xl mx-auto w-full">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-text-main tracking-tight mb-1">
              {isEditing ? "Update Candidate Profile" : "My Profile"}
            </h1>
            <p className="text-sm md:text-base text-text-muted">
              Manage your personal information and career preferences
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isEditing && (
              <div className="relative">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="application/pdf,.docx"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  disabled={isParsing}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-primary font-bold rounded-xl text-sm hover:bg-light transition-colors border border-primary/20 shadow-sm"
                >
                  <FiUpload />
                  {isParsing ? "AI Parsing..." : "Auto-fill via Biodata"}
                </button>
              </div>
            )}

            {hasProfile && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              >
                <FiEdit2 /> Edit Profile
              </button>
            )}

            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 px-4 py-2 bg-white text-text-muted font-bold rounded-xl text-sm border border-secondary/20 hover:bg-light transition-colors"
            >
              <FiArrowLeft /> Dashboard
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft border border-secondary/10 overflow-hidden">
          {/* VIEW MODE */}
          {hasProfile && !isEditing ? (
            <div className="p-6 md:p-8 space-y-8 animate-fade-in">
              {/* Personal Info Grid */}
              <section>
                <h3 className="text-xs font-bold text-text-light uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FiUser className="text-lg text-primary" /> Personal Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  <DetailItem label="Phone" value={form.phone} />
                  <DetailItem label="Age" value={form.age} />
                  <DetailItem label="Gender" value={form.gender} capitalize />
                  <DetailItem
                    label="Location"
                    value={`${form.city}, ${form.state}`}
                  />
                  <DetailItem
                    label="Personality"
                    value={form.personalityType || "Not set"}
                  />
                </div>
              </section>

              <hr className="border-secondary/10" />

              {/* Education Grid */}
              <section>
                <h3 className="text-xs font-bold text-text-light uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FiBookOpen className="text-lg text-primary" /> Education
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <DetailItem label="Level" value={form.education} />
                  {form.stream && (
                    <DetailItem label="Stream" value={form.stream} />
                  )}
                </div>
              </section>

              <hr className="border-secondary/10" />

              {/* Skills & Goals - Full Width */}
              <section className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-text-light uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FiActivity className="text-lg text-primary" /> Skills &
                    Interests
                  </h3>
                  <div className="bg-surface p-5 rounded-xl border border-secondary/10">
                    <p className="text-text-main font-medium mb-4 leading-relaxed">
                      <span className="text-primary font-bold">Skills:</span>{" "}
                      {form.skills}
                    </p>
                    <p className="text-text-main font-medium leading-relaxed">
                      <span className="text-primary font-bold">Interests:</span>{" "}
                      {form.interests || "Not specified"}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-text-light uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FiTarget className="text-lg text-primary" /> Career
                    Objective
                  </h3>
                  <div className="bg-surface p-5 rounded-xl border border-secondary/10">
                    <p className="text-text-main leading-relaxed">
                      {form.careerGoal}
                    </p>
                  </div>
                </div>
              </section>

              {/* "Others" Data */}
              {Object.keys(others).length > 0 && (
                <>
                  <hr className="border-secondary/10" />
                  <section>
                    <h3 className="text-xs font-bold text-text-light uppercase tracking-wider mb-4 border-l-4 border-primary pl-3">
                      Additional AI Insights
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(others).map(([key, value]) => (
                        <div
                          key={key}
                          className="bg-light/50 p-4 rounded-xl border border-primary/10"
                        >
                          <strong className="block text-primary-dark capitalize text-xs mb-1">
                            {key.replace(/_/g, " ")}
                          </strong>
                          <span className="text-text-main text-sm font-medium">
                            {Array.isArray(value)
                              ? value.join(", ")
                              : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              )}
            </div>
          ) : (
            /* EDIT FORM MODE */
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="p-6 md:p-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-text-main">
                    Phone Number *
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    placeholder="9876543210"
                    className="w-full px-4 py-3 bg-surface border border-secondary/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm md:text-base font-medium text-text-main placeholder:text-text-muted/50"
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-500 font-bold mt-1">
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Age */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-text-main">
                    Age *
                  </label>
                  <input
                    type="number"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    placeholder="20"
                    className="w-full px-4 py-3 bg-surface border border-secondary/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm md:text-base font-medium text-text-main placeholder:text-text-muted/50"
                  />
                  {errors.age && (
                    <p className="text-xs text-red-500 font-bold mt-1">
                      {errors.age}
                    </p>
                  )}
                </div>

                {/* Gender */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-text-main">
                    Gender *
                  </label>
                  <select
                    value={form.gender.toLowerCase()}
                    onChange={(e) =>
                      setForm({ ...form, gender: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-surface border border-secondary/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm md:text-base font-medium text-text-main appearance-none cursor-pointer"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && (
                    <p className="text-xs text-red-500 font-bold mt-1">
                      {errors.gender}
                    </p>
                  )}
                </div>

                {/* Personality */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-text-main">
                    Personality Type
                  </label>
                  <select
                    value={form.personalityType}
                    onChange={(e) =>
                      setForm({ ...form, personalityType: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-surface border border-secondary/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm md:text-base font-medium text-text-main appearance-none cursor-pointer"
                  >
                    <option value="">Select Personality</option>
                    <option value="Introvert">Introvert</option>
                    <option value="Extrovert">Extrovert</option>
                    <option value="Ambivert">Ambivert</option>
                  </select>
                </div>

                {/* Location - City */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-text-main">
                    City
                  </label>
                  <input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="City"
                    className="w-full px-4 py-3 bg-surface border border-secondary/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm md:text-base font-medium text-text-main placeholder:text-text-muted/50"
                  />
                </div>

                {/* Location - State */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-text-main">
                    State
                  </label>
                  <input
                    value={form.state}
                    onChange={(e) =>
                      setForm({ ...form, state: e.target.value })
                    }
                    placeholder="State"
                    className="w-full px-4 py-3 bg-surface border border-secondary/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm md:text-base font-medium text-text-main placeholder:text-text-muted/50"
                  />
                </div>

                {/* Education */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-text-main">
                    Education Level *
                  </label>
                  <select
                    value={form.education}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        education: e.target.value,
                        stream: "",
                      })
                    }
                    className="w-full px-4 py-3 bg-surface border border-secondary/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm md:text-base font-medium text-text-main appearance-none cursor-pointer"
                  >
                    <option value="">Select Education</option>
                    <option value="10th">10th</option>
                    <option value="12th">12th</option>
                    <option value="UG">UG</option>
                    <option value="PG">PG</option>
                    <option value="Post PG">Post PG</option>
                  </select>
                  {errors.education && (
                    <p className="text-xs text-red-500 font-bold mt-1">
                      {errors.education}
                    </p>
                  )}
                </div>

                {/* Stream (Conditional) */}
                {educationNeedsStream && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-text-main">
                      Stream *
                    </label>
                    <input
                      value={form.stream}
                      onChange={(e) =>
                        setForm({ ...form, stream: e.target.value })
                      }
                      placeholder="e.g. Computer Science"
                      className="w-full px-4 py-3 bg-surface border border-secondary/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm md:text-base font-medium text-text-main placeholder:text-text-muted/50"
                    />
                    {errors.stream && (
                      <p className="text-xs text-red-500 font-bold mt-1">
                        {errors.stream}
                      </p>
                    )}
                  </div>
                )}

                {/* Full Width Fields */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-sm font-bold text-text-main">
                    Skills * (Comma separated)
                  </label>
                  <input
                    value={form.skills}
                    onChange={(e) =>
                      setForm({ ...form, skills: e.target.value })
                    }
                    placeholder="React, Python, Public Speaking"
                    className="w-full px-4 py-3 bg-surface border border-secondary/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm md:text-base font-medium text-text-main placeholder:text-text-muted/50"
                  />
                  {errors.skills && (
                    <p className="text-xs text-red-500 font-bold mt-1">
                      {errors.skills}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-sm font-bold text-text-main">
                    Interests & Hobbies
                  </label>
                  <textarea
                    value={form.interests}
                    onChange={(e) =>
                      setForm({ ...form, interests: e.target.value })
                    }
                    placeholder="What do you love doing?"
                    rows={3}
                    className="w-full px-4 py-3 bg-surface border border-secondary/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm md:text-base font-medium text-text-main placeholder:text-text-muted/50 resize-none"
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-sm font-bold text-text-main">
                    Career Goal *
                  </label>
                  <textarea
                    value={form.careerGoal}
                    onChange={(e) =>
                      setForm({ ...form, careerGoal: e.target.value })
                    }
                    placeholder="Where do you see yourself in 5 years?"
                    rows={3}
                    className="w-full px-4 py-3 bg-surface border border-secondary/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm md:text-base font-medium text-text-main placeholder:text-text-muted/50 resize-none"
                  />
                  {errors.careerGoal && (
                    <p className="text-xs text-red-500 font-bold mt-1">
                      {errors.careerGoal}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 mt-8 pt-6 border-t border-secondary/10">
                <button
                  type="submit"
                  disabled={isParsing}
                  className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:bg-primary-hover hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                >
                  {isParsing ? (
                    "Processing..."
                  ) : (
                    <>
                      <FiSave /> Save & Update
                    </>
                  )}
                </button>
                {hasProfile && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 text-text-muted font-bold hover:bg-surface rounded-xl transition-colors border border-transparent hover:border-secondary/20"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

// Helper Component for View Mode
const DetailItem = ({ label, value, capitalize = false }) => (
  <div className="p-4 bg-surface rounded-xl border border-secondary/10">
    <span className="block text-xs font-bold text-text-light uppercase tracking-wide mb-1">
      {label}
    </span>
    <p className={`text-text-main font-bold ${capitalize ? "capitalize" : ""}`}>
      {value || "—"}
    </p>
  </div>
);

export default StudentProfile;
