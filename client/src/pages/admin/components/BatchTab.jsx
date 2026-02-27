import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  FiPlus,
  FiX,
  FiCheck,
  FiLayers,
  FiClock,
  FiCalendar,
  FiUsers,
  FiBookOpen,
  FiArrowLeft,
  FiGrid,
} from "react-icons/fi";
import { createBatch, fetchBatches } from "../../../services/batchApi";

const BatchTab = ({ institution }) => {
  const [viewMode, setViewMode] = useState("list"); // "list" or "form"
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [batchForm, setBatchForm] = useState({
    name: "",
    className: "",
    educationLevel: "",
    date: "",
    startTime: "",
    endTime: "",
    maxStudents: 50,
  });

  const loadBatches = async () => {
    try {
      setLoading(true);
      const res = await fetchBatches();
      setBatches(res.batches || res || []);
    } catch (err) {
      toast.error("Failed to load batches");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const handleAddNew = () => {
    if (!institution) {
      return toast.warning(
        "Please create an institution first before creating batches.",
      );
    }
    setBatchForm({
      name: "",
      className: "",
      educationLevel: "",
      date: "",
      startTime: "",
      endTime: "",
      maxStudents: 50,
    });
    setViewMode("form");
  };

  const handleCreateBatch = async () => {
    if (!institution) return toast.error("Create an institution first");
    if (!batchForm.name || !batchForm.className || !batchForm.educationLevel) {
      return toast.error("Batch name, class & education level required");
    }
    if (!batchForm.date || !batchForm.startTime || !batchForm.endTime) {
      return toast.error("Date and time slots are required");
    }

    setIsSubmitting(true);
    try {
      const res = await createBatch({
        name: batchForm.name,
        className: batchForm.className,
        educationLevel: batchForm.educationLevel,
        slot: {
          date: batchForm.date,
          startTime: batchForm.startTime,
          endTime: batchForm.endTime,
        },
        maxStudents: batchForm.maxStudents,
      });

      if (res.batch || res) {
        toast.success("Batch created successfully");
        await loadBatches();
        setViewMode("list");
      }
    } catch (error) {
      toast.error(error.message || "Failed to create batch");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":");
    const h = parseInt(hours, 10);
    if (isNaN(h)) return timeStr;
    const ampm = h >= 12 ? "PM" : "AM";
    const formattedHours = h % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  };

  return (
    <div className="w-full space-y-8 pb-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in-up delay-[100ms]">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-[#1C1E21] dark:text-white tracking-tight">
            Batch & Slots
          </h1>
          <p className="mt-1 text-sm text-[#4B5563] dark:text-white/60">
            {viewMode === "list"
              ? "Manage student batches and scheduling slots"
              : "Create a new batch and assign scheduling slots"}
          </p>
        </div>

        {viewMode === "list" ? (
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#00A8E8] to-[#007EA7] hover:from-[#00A8E8] hover:to-[#00A8E8] text-white rounded-xl shadow-lg shadow-[#00A8E8]/20 transition-all duration-300 hover:-translate-y-0.5 font-bold text-sm w-fit"
          >
            <FiPlus size={18} />
            <span>Add Batch</span>
          </button>
        ) : (
          <button
            onClick={() => setViewMode("list")}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 hover:bg-[#F8FAFC] dark:hover:bg-white/10 text-[#4B5563] dark:text-white/80 rounded-xl transition-all duration-300 font-bold text-sm w-fit group"
          >
            <FiArrowLeft
              size={18}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span>Back to List</span>
          </button>
        )}
      </header>

      {/* Main Content Area */}
      {viewMode === "list" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up delay-[200ms]">
          {loading ? (
            <div className="col-span-full flex justify-center py-20">
              <span className="flex h-10 w-10">
                <span className="animate-ping absolute inline-flex h-10 w-10 rounded-full bg-[#00A8E8] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-10 w-10 bg-[#007EA7]"></span>
              </span>
            </div>
          ) : !institution ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 bg-amber-500/10 dark:bg-amber-500/5 backdrop-blur-xl border border-amber-500/20 rounded-[2rem]">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-500/20 rounded-full flex items-center justify-center mb-4 text-amber-600 dark:text-amber-400">
                <FiBookOpen size={28} />
              </div>
              <h3 className="text-xl font-bold text-[#1C1E21] dark:text-white mb-2">
                No Institution Setup
              </h3>
              <p className="text-[#4B5563] dark:text-white/60 text-center max-w-sm">
                You must complete your Institution Profile first before creating
                any batches.
              </p>
            </div>
          ) : batches.length > 0 ? (
            batches.map((batch, idx) => {
              // Handle potential deeply nested slots from backend
              const slot = batch.slot || {};
              const studentsAssigned = batch.students
                ? batch.students.length
                : 0;
              const maxCount = batch.maxStudents || 50;

              return (
                <div
                  key={batch._id}
                  className={`bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 p-6 rounded-[2rem] shadow-soft flex flex-col items-start gap-4 transition-all duration-300 hover:shadow-xl hover:border-[#007EA7]/30 animate-fade-in-up relative overflow-hidden`}
                  style={{
                    animationDelay: `${200 + idx * 100}ms`,
                    animationFillMode: "both",
                  }}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#00A8E8]/10 to-transparent rounded-bl-full pointer-events-none"></div>

                  <div className="flex items-center gap-4 w-full relative z-10">
                    <div className="w-14 h-14 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shadow-inner text-xl font-bold">
                      <FiLayers size={24} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h3
                        className="font-bold text-lg text-[#1C1E21] dark:text-white truncate"
                        title={batch.name}
                      >
                        {batch.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs font-medium text-[#9CA3AF] dark:text-white/50 mt-1">
                        <span className="px-2 py-0.5 bg-black/5 dark:bg-white/10 rounded-md truncate">
                          {batch.className}
                        </span>
                        <span>•</span>
                        <span className="truncate">{batch.educationLevel}</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full bg-black/5 dark:bg-white/5 h-px my-1"></div>

                  {/* Batch Details */}
                  <div className="w-full space-y-3 mb-2 flex-1 relative z-10">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-[#4B5563] dark:text-white/70">
                        <FiCalendar size={16} className="text-[#00A8E8]" />
                        <span>
                          {slot.date
                            ? new Date(slot.date).toLocaleDateString()
                            : "No Date"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-[#4B5563] dark:text-white/70">
                        <FiClock size={16} className="text-[#00A8E8]" />
                        <span className="font-mono text-xs mt-0.5">
                          {formatTime(slot.startTime)} -{" "}
                          {formatTime(slot.endTime)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-[#4B5563] dark:text-white/70">
                        <FiUsers size={16} className="text-[#00A8E8]" />
                        <span>Capacity</span>
                      </div>
                      <span className="font-bold text-[#1C1E21] dark:text-white font-mono text-xs">
                        {studentsAssigned} / {maxCount}
                      </span>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div className="w-full h-1.5 bg-black/5 dark:bg-white/10 rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#00A8E8] to-[#007EA7] rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (studentsAssigned / maxCount) * 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[2rem]">
              <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                <FiGrid
                  size={32}
                  className="text-gray-400 dark:text-white/30"
                />
              </div>
              <h3 className="text-xl font-bold text-[#1C1E21] dark:text-white mb-2">
                No Batches Found
              </h3>
              <p className="text-[#4B5563] dark:text-white/60 text-center max-w-sm mb-6">
                Organize your students by creating class batches with scheduled
                time slots.
              </p>
              <button
                onClick={handleAddNew}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00A8E8] to-[#007EA7] hover:from-[#00A8E8] hover:to-[#00A8E8] text-white rounded-xl shadow-lg shadow-[#00A8E8]/20 transition-all font-bold"
              >
                <FiPlus size={20} />
                <span>Create First Batch</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Form View */
        <div className="bg-white/60 dark:bg-[#00171F]/50 backdrop-blur-xl border border-black/5 dark:border-white/10 p-6 md:p-10 rounded-[2rem] shadow-soft animate-fade-in-up delay-[200ms]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-[#4B5563] dark:text-white/80 ml-1">
                Batch Name *
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#00A8E8] transition-colors">
                  <FiLayers size={18} />
                </div>
                <input
                  type="text"
                  placeholder="e.g. Morning Tech Batch"
                  value={batchForm.name}
                  onChange={(e) =>
                    setBatchForm({ ...batchForm, name: e.target.value })
                  }
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#00171F]/80 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#00A8E8]/50 outline-none transition-all text-[#1C1E21] dark:text-white placeholder-gray-400 dark:placeholder-white/30"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-[#4B5563] dark:text-white/80 ml-1">
                Class / Section *
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#00A8E8] transition-colors">
                  <FiBookOpen size={18} />
                </div>
                <input
                  type="text"
                  placeholder="e.g. CSE-A"
                  value={batchForm.className}
                  onChange={(e) =>
                    setBatchForm({ ...batchForm, className: e.target.value })
                  }
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#00171F]/80 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#00A8E8]/50 outline-none transition-all text-[#1C1E21] dark:text-white placeholder-gray-400 dark:placeholder-white/30"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-[#4B5563] dark:text-white/80 ml-1">
                Education Level *
              </label>
              <select
                value={batchForm.educationLevel}
                onChange={(e) =>
                  setBatchForm({ ...batchForm, educationLevel: e.target.value })
                }
                className="w-full px-4 py-3 bg-white dark:bg-[#00171F]/80 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#00A8E8]/50 outline-none transition-all text-[#1C1E21] dark:text-white appearance-none"
              >
                <option value="" disabled className="text-gray-400">
                  -- Select Level --
                </option>
                <option value="10th">10th</option>
                <option value="12th">12th</option>
                <option value="Diploma">Diploma</option>
                <option value="UG">UG (Undergraduate)</option>
                <option value="PG">PG (Postgraduate)</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-[#4B5563] dark:text-white/80 ml-1">
                Max Students
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#00A8E8] transition-colors">
                  <FiUsers size={18} />
                </div>
                <input
                  type="number"
                  min="1"
                  value={batchForm.maxStudents}
                  onChange={(e) =>
                    setBatchForm({
                      ...batchForm,
                      maxStudents: Number(e.target.value),
                    })
                  }
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#00171F]/80 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#00A8E8]/50 outline-none transition-all text-[#1C1E21] dark:text-white"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <div className="w-full bg-black/5 dark:bg-white/5 h-px my-2"></div>
              <h4 className="font-bold text-[#1C1E21] dark:text-white mb-2 ml-1 flex items-center gap-2">
                <FiCalendar className="text-[#00A8E8]" /> Scheduling Slot
              </h4>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-[#4B5563] dark:text-white/80 ml-1">
                Date *
              </label>
              <input
                type="date"
                value={batchForm.date}
                onChange={(e) =>
                  setBatchForm({ ...batchForm, date: e.target.value })
                }
                className="w-full px-4 py-3 bg-white dark:bg-[#00171F]/80 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#00A8E8]/50 outline-none transition-all text-[#1C1E21] dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[#4B5563] dark:text-white/80 ml-1">
                  Start Time *
                </label>
                <input
                  type="time"
                  value={batchForm.startTime}
                  onChange={(e) =>
                    setBatchForm({ ...batchForm, startTime: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white dark:bg-[#00171F]/80 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#00A8E8]/50 outline-none transition-all text-[#1C1E21] dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[#4B5563] dark:text-white/80 ml-1">
                  End Time *
                </label>
                <input
                  type="time"
                  value={batchForm.endTime}
                  onChange={(e) =>
                    setBatchForm({ ...batchForm, endTime: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white dark:bg-[#00171F]/80 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#00A8E8]/50 outline-none transition-all text-[#1C1E21] dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col md:flex-row items-center gap-4 justify-end border-t border-black/5 dark:border-white/10 pt-6">
            <button
              onClick={() => setViewMode("list")}
              disabled={isSubmitting}
              className="w-full md:w-auto px-6 py-3 rounded-xl border border-black/10 dark:border-white/10 text-[#4B5563] dark:text-white/80 font-bold hover:bg-[#F8FAFC] dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <FiX size={18} />
              <span>Discard Changes</span>
            </button>

            <button
              onClick={handleCreateBatch}
              disabled={isSubmitting}
              className="w-full md:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-[#00A8E8] to-[#007EA7] hover:from-[#00A8E8] hover:to-[#00A8E8] text-white font-bold shadow-lg shadow-[#00A8E8]/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Processing...
                </span>
              ) : (
                <>
                  <FiCheck size={18} />
                  <span>Create Batch</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchTab;
