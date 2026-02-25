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
    dob: "",
    gender: "",
    motherTongue: "",
    education: "",
    stream: "",
    personalityType: "",
    area: "",
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
            dob: p.dob ? new Date(p.dob).toISOString().split("T")[0] : "",
            gender: p.gender || "",
            motherTongue: p.motherTongue || "",
            education: p.education || "",
            stream: p.stream || "",
            personalityType: p.personalityType || "",
            area: p.area || "",
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
      <div className="flex min-h-screen items-center justify-center bg-surface dark:bg-[#00171F] transition-colors duration-300">
        <div className="w-8 h-8 border-4 border-primary/30 dark:border-white/10 border-t-primary dark:border-t-white rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-surface dark:bg-[#00171F] font-sans transition-colors duration-300">
      <StudentSidebar />
      <main className="flex-1 p-8 md:p-10 md:ml-72 max-w-5xl mx-auto w-full">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-[#1C1E21] dark:text-white tracking-tight mb-1">
              {isEditing ? "Update Candidate Profile" : "My Profile"}
            </h1>
            <p className="text-sm md:text-base text-[#4B5563] dark:text-white/60">
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
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#00171F] text-[#00A8E8] font-bold rounded-xl text-sm hover:bg-[#F8FAFC] dark:hover:bg-white/5 transition-colors border border-[#00A8E8]/20 dark:border-white/10 shadow-sm"
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
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-transparent text-[#4B5563] dark:text-white/70 font-bold rounded-xl text-sm border border-[#007EA7]/20 dark:border-white/20 hover:bg-[#F8FAFC] dark:hover:bg-white/10 transition-colors"
            >
              <FiArrowLeft /> Dashboard
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-white/5 rounded-2xl shadow-soft border border-[#007EA7]/10 dark:border-white/10 overflow-hidden backdrop-blur-md">
          {/* VIEW MODE */}
          {hasProfile && !isEditing ? (
            <div className="p-6 md:p-8 space-y-8 animate-fade-in">
              {/* Personal Info Grid */}
              <section>
                <h3 className="text-xs font-bold text-[#9CA3AF] dark:text-white/50 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FiUser className="text-lg text-[#00A8E8]" /> Personal Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  <DetailItem label="Phone" value={form.phone} />
                  <DetailItem label="Age" value={form.age} />
                  <DetailItem
                    label="DOB"
                    value={
                      form.dob ? new Date(form.dob).toLocaleDateString() : ""
                    }
                  />
                  <DetailItem label="Gender" value={form.gender} capitalize />
                  <DetailItem
                    label="Mother Tongue"
                    value={form.motherTongue}
                    capitalize
                  />
                  <DetailItem
                    label="Location"
                    value={[form.area, form.city, form.state]
                      .filter(Boolean)
                      .join(", ")}
                  />
                  <DetailItem
                    label="Personality"
                    value={form.personalityType || "Not set"}
                  />
                </div>
              </section>

              <hr className="border-[#007EA7]/10 dark:border-white/10" />

              {/* Education Grid */}
              <section>
                <h3 className="text-xs font-bold text-[#9CA3AF] dark:text-white/50 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FiBookOpen className="text-lg text-[#00A8E8]" /> Education
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <DetailItem label="Level" value={form.education} />
                  {form.stream && (
                    <DetailItem label="Stream" value={form.stream} />
                  )}
                </div>
              </section>

              <hr className="border-[#007EA7]/10 dark:border-white/10" />

              {/* Skills & Goals - Full Width */}
              <section className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-[#9CA3AF] dark:text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FiActivity className="text-lg text-[#00A8E8]" /> Skills &
                    Interests
                  </h3>
                  <div className="bg-[#F8FAFC] dark:bg-[#00171F]/50 p-5 rounded-xl border border-[#007EA7]/10 dark:border-white/10 shadow-inner">
                    <p className="text-[#1C1E21] dark:text-white/90 font-medium mb-4 leading-relaxed">
                      <span className="text-[#00A8E8] dark:text-[#00A8E8] font-bold">
                        Skills:
                      </span>{" "}
                      {form.skills}
                    </p>
                    <p className="text-[#1C1E21] dark:text-white/90 font-medium leading-relaxed">
                      <span className="text-[#00A8E8] dark:text-[#00A8E8] font-bold">
                        Interests:
                      </span>{" "}
                      {form.interests || "Not specified"}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-[#9CA3AF] dark:text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FiTarget className="text-lg text-[#00A8E8]" /> Career
                    Objective
                  </h3>
                  <div className="bg-[#F8FAFC] dark:bg-[#00171F]/50 p-5 rounded-xl border border-[#007EA7]/10 dark:border-white/10 shadow-inner">
                    <p className="text-[#1C1E21] dark:text-white/90 leading-relaxed">
                      {form.careerGoal}
                    </p>
                  </div>
                </div>
              </section>

              {/* "Others" Data */}
              {Object.keys(others).length > 0 && (
                <>
                  <hr className="border-[#007EA7]/10 dark:border-white/10" />
                  <section>
                    <h3 className="text-xs font-bold text-[#9CA3AF] dark:text-white/50 uppercase tracking-wider mb-4 border-l-4 border-[#00A8E8] pl-3">
                      Additional AI Insights
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(others).map(([key, value]) => (
                        <div
                          key={key}
                          className="bg-[#F0F2F5]/50 dark:bg-[#00171F]/50 p-4 rounded-xl border border-[#00A8E8]/10 dark:border-white/10"
                        >
                          <strong className="block text-[#007EA7] dark:text-[#00A8E8] capitalize text-xs mb-1">
                            {key.replace(/_/g, " ")}
                          </strong>
                          <span className="text-[#1C1E21] dark:text-white/90 text-sm font-medium">
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
                  <label className="text-sm font-bold text-[#1C1E21] dark:text-white/80">
                    Phone Number *
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    placeholder="9876543210"
                    className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#00171F]/50 border border-[#007EA7]/20 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A8E8]/20 focus:border-[#00A8E8] transition-all text-sm md:text-base font-medium text-[#1C1E21] dark:text-white placeholder:text-[#4B5563]/50 dark:placeholder:text-white/30 shadow-inner"
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-500 font-bold mt-1">
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Age */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[#1C1E21] dark:text-white/80">
                    Age *
                  </label>
                  <input
                    type="number"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    placeholder="20"
                    className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#00171F]/50 border border-[#007EA7]/20 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A8E8]/20 focus:border-[#00A8E8] transition-all text-sm md:text-base font-medium text-[#1C1E21] dark:text-white placeholder:text-[#4B5563]/50 dark:placeholder:text-white/30 shadow-inner"
                  />
                  {errors.age && (
                    <p className="text-xs text-red-500 font-bold mt-1">
                      {errors.age}
                    </p>
                  )}
                </div>

                {/* DOB */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[#1C1E21] dark:text-white/80">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={form.dob}
                    onChange={(e) => setForm({ ...form, dob: e.target.value })}
                    className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#00171F]/50 border border-[#007EA7]/20 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A8E8]/20 focus:border-[#00A8E8] transition-all text-sm md:text-base font-medium text-[#1C1E21] dark:text-white placeholder:text-[#4B5563]/50 dark:placeholder:text-white/30 shadow-inner"
                  />
                </div>

                {/* Gender */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[#1C1E21] dark:text-white/80">
                    Gender *
                  </label>
                  <select
                    value={form.gender.toLowerCase()}
                    onChange={(e) =>
                      setForm({ ...form, gender: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#00171F]/50 border border-[#007EA7]/20 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A8E8]/20 focus:border-[#00A8E8] transition-all text-sm md:text-base font-medium text-[#1C1E21] dark:text-white appearance-none cursor-pointer shadow-inner"
                  >
                    <option value="" className="dark:bg-[#00171F]">
                      Select Gender
                    </option>
                    <option value="male" className="dark:bg-[#00171F]">
                      Male
                    </option>
                    <option value="female" className="dark:bg-[#00171F]">
                      Female
                    </option>
                    <option value="other" className="dark:bg-[#00171F]">
                      Other
                    </option>
                  </select>
                  {errors.gender && (
                    <p className="text-xs text-red-500 font-bold mt-1">
                      {errors.gender}
                    </p>
                  )}
                </div>

                {/* Mother Tongue */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[#1C1E21] dark:text-white/80">
                    Mother Tongue
                  </label>
                  <input
                    value={form.motherTongue}
                    onChange={(e) =>
                      setForm({ ...form, motherTongue: e.target.value })
                    }
                    placeholder="e.g. English, Hindi, Spanish"
                    className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#00171F]/50 border border-[#007EA7]/20 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A8E8]/20 focus:border-[#00A8E8] transition-all text-sm md:text-base font-medium text-[#1C1E21] dark:text-white placeholder:text-[#4B5563]/50 dark:placeholder:text-white/30 shadow-inner"
                  />
                </div>

                {/* Personality */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[#1C1E21] dark:text-white/80">
                    Personality Type
                  </label>
                  <select
                    value={form.personalityType}
                    onChange={(e) =>
                      setForm({ ...form, personalityType: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#00171F]/50 border border-[#007EA7]/20 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A8E8]/20 focus:border-[#00A8E8] transition-all text-sm md:text-base font-medium text-[#1C1E21] dark:text-white appearance-none cursor-pointer shadow-inner"
                  >
                    <option value="" className="dark:bg-[#00171F]">
                      Select Personality
                    </option>
                    <option value="Introvert" className="dark:bg-[#00171F]">
                      Introvert
                    </option>
                    <option value="Extrovert" className="dark:bg-[#00171F]">
                      Extrovert
                    </option>
                    <option value="Ambivert" className="dark:bg-[#00171F]">
                      Ambivert
                    </option>
                  </select>
                </div>

                {/* Location - Area */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[#1C1E21] dark:text-white/80">
                    Area/Locality
                  </label>
                  <input
                    value={form.area}
                    onChange={(e) => setForm({ ...form, area: e.target.value })}
                    placeholder="e.g. Downtown, Sector 5"
                    className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#00171F]/50 border border-[#007EA7]/20 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A8E8]/20 focus:border-[#00A8E8] transition-all text-sm md:text-base font-medium text-[#1C1E21] dark:text-white placeholder:text-[#4B5563]/50 dark:placeholder:text-white/30 shadow-inner"
                  />
                </div>

                {/* Location - City */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[#1C1E21] dark:text-white/80">
                    City
                  </label>
                  <input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="City"
                    className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#00171F]/50 border border-[#007EA7]/20 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A8E8]/20 focus:border-[#00A8E8] transition-all text-sm md:text-base font-medium text-[#1C1E21] dark:text-white placeholder:text-[#4B5563]/50 dark:placeholder:text-white/30 shadow-inner"
                  />
                </div>

                {/* Location - State */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[#1C1E21] dark:text-white/80">
                    State
                  </label>
                  <input
                    value={form.state}
                    onChange={(e) =>
                      setForm({ ...form, state: e.target.value })
                    }
                    placeholder="State"
                    className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#00171F]/50 border border-[#007EA7]/20 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A8E8]/20 focus:border-[#00A8E8] transition-all text-sm md:text-base font-medium text-[#1C1E21] dark:text-white placeholder:text-[#4B5563]/50 dark:placeholder:text-white/30 shadow-inner"
                  />
                </div>

                {/* Education */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[#1C1E21] dark:text-white/80">
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
                    className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#00171F]/50 border border-[#007EA7]/20 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A8E8]/20 focus:border-[#00A8E8] transition-all text-sm md:text-base font-medium text-[#1C1E21] dark:text-white appearance-none cursor-pointer shadow-inner"
                  >
                    <option value="" className="dark:bg-[#00171F]">
                      Select Education
                    </option>
                    <option value="8th" className="dark:bg-[#00171F]">
                      8th
                    </option>
                    <option value="9th" className="dark:bg-[#00171F]">
                      9th
                    </option>
                    <option value="10th" className="dark:bg-[#00171F]">
                      10th
                    </option>
                    <option value="12th" className="dark:bg-[#00171F]">
                      12th
                    </option>
                    <option value="UG" className="dark:bg-[#00171F]">
                      UG
                    </option>
                    <option value="PG" className="dark:bg-[#00171F]">
                      PG
                    </option>
                    <option value="Post PG" className="dark:bg-[#00171F]">
                      Post PG
                    </option>
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
                    <label className="text-sm font-bold text-[#1C1E21] dark:text-white/80">
                      Stream *
                    </label>
                    <input
                      value={form.stream}
                      onChange={(e) =>
                        setForm({ ...form, stream: e.target.value })
                      }
                      placeholder="e.g. Computer Science"
                      className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#00171F]/50 border border-[#007EA7]/20 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A8E8]/20 focus:border-[#00A8E8] transition-all text-sm md:text-base font-medium text-[#1C1E21] dark:text-white placeholder:text-[#4B5563]/50 dark:placeholder:text-white/30 shadow-inner"
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
                  <label className="text-sm font-bold text-[#1C1E21] dark:text-white/80">
                    Skills * (Comma separated)
                  </label>
                  <input
                    value={form.skills}
                    onChange={(e) =>
                      setForm({ ...form, skills: e.target.value })
                    }
                    placeholder="React, Python, Public Speaking"
                    className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#00171F]/50 border border-[#007EA7]/20 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A8E8]/20 focus:border-[#00A8E8] transition-all text-sm md:text-base font-medium text-[#1C1E21] dark:text-white placeholder:text-[#4B5563]/50 dark:placeholder:text-white/30 shadow-inner"
                  />
                  {errors.skills && (
                    <p className="text-xs text-red-500 font-bold mt-1">
                      {errors.skills}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-sm font-bold text-[#1C1E21] dark:text-white/80">
                    Interests & Hobbies
                  </label>
                  <textarea
                    value={form.interests}
                    onChange={(e) =>
                      setForm({ ...form, interests: e.target.value })
                    }
                    placeholder="What do you love doing?"
                    rows={3}
                    className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#00171F]/50 border border-[#007EA7]/20 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A8E8]/20 focus:border-[#00A8E8] transition-all text-sm md:text-base font-medium text-[#1C1E21] dark:text-white placeholder:text-[#4B5563]/50 dark:placeholder:text-white/30 resize-none shadow-inner"
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-sm font-bold text-[#1C1E21] dark:text-white/80">
                    Career Goal *
                  </label>
                  <textarea
                    value={form.careerGoal}
                    onChange={(e) =>
                      setForm({ ...form, careerGoal: e.target.value })
                    }
                    placeholder="Where do you see yourself in 5 years?"
                    rows={3}
                    className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#00171F]/50 border border-[#007EA7]/20 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A8E8]/20 focus:border-[#00A8E8] transition-all text-sm md:text-base font-medium text-[#1C1E21] dark:text-white placeholder:text-[#4B5563]/50 dark:placeholder:text-white/30 resize-none shadow-inner"
                  />
                  {errors.careerGoal && (
                    <p className="text-xs text-red-500 font-bold mt-1">
                      {errors.careerGoal}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 mt-8 pt-6 border-t border-[#007EA7]/10 dark:border-white/10">
                <button
                  type="submit"
                  disabled={isParsing}
                  className="px-8 py-3 bg-[#00A8E8] text-white font-bold rounded-xl shadow-lg shadow-[#00A8E8]/25 hover:shadow-xl hover:bg-[#007EA7] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
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
                    className="px-6 py-3 text-[#4B5563] dark:text-white/60 font-bold hover:bg-[#F8FAFC] dark:hover:bg-white/10 rounded-xl transition-colors border border-transparent hover:border-[#007EA7]/20 dark:hover:border-white/20"
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
  <div className="p-4 bg-[#F8FAFC] dark:bg-[#00171F]/50 rounded-xl border border-[#007EA7]/10 dark:border-white/10 shadow-inner">
    <span className="block text-xs font-bold text-[#9CA3AF] dark:text-white/50 uppercase tracking-wide mb-1">
      {label}
    </span>
    <p
      className={`text-[#1C1E21] dark:text-white/90 font-bold ${capitalize ? "capitalize" : ""}`}
    >
      {value || "—"}
    </p>
  </div>
);

export default StudentProfile;
