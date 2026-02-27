import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  FiEdit3,
  FiCheck,
  FiX,
  FiPlus,
  FiGlobe,
  FiMapPin,
  FiHash,
  FiArrowLeft,
  FiBook,
} from "react-icons/fi";
import {
  createInstitution,
  updateInstitution,
  fetchInstitutions,
} from "../../../services/institutionApi";

const InstitutionTab = ({
  institution: adminInstitution,
  setInstitution: setAdminInstitution,
}) => {
  const [viewMode, setViewMode] = useState("list"); // "list" or "form"
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState(null);

  const [institutionForm, setInstitutionForm] = useState({
    name: "",
    code: "",
    address: "",
    website: "",
  });

  const loadInstitutions = async () => {
    try {
      setLoading(true);
      const res = await fetchInstitutions();
      setInstitutions(res.institutions || []);
    } catch (err) {
      toast.error("Failed to load institutions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstitutions();
  }, []);

  const handleAddNew = () => {
    setEditingInstitution(null);
    setInstitutionForm({ name: "", code: "", address: "", website: "" });
    setViewMode("form");
  };

  const handleEdit = (inst) => {
    setEditingInstitution(inst);
    setInstitutionForm({
      name: inst.name || "",
      code: inst.code || "",
      address: inst.address || "",
      website: inst.website || "",
    });
    setViewMode("form");
  };

  const handleSave = async () => {
    if (!institutionForm.name || !institutionForm.code) {
      return toast.error("Institution name & code required");
    }

    setLoading(true);
    try {
      if (editingInstitution?._id) {
        const res = await updateInstitution(
          editingInstitution._id,
          institutionForm,
        );
        toast.success("Changes saved successfully");
        if (adminInstitution?._id === editingInstitution._id) {
          setAdminInstitution(res.institution);
        }
      } else {
        const res = await createInstitution(institutionForm);
        toast.success("Institution profile created");
        if (!adminInstitution) {
          setAdminInstitution(res.institution);
        }
      }
      await loadInstitutions();
      setViewMode("list");
    } catch (error) {
      toast.error(error.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-8 pb-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in-up delay-[100ms]">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-[#1C1E21] dark:text-white tracking-tight">
            Institutions
          </h1>
          <p className="mt-1 text-sm text-[#4B5563] dark:text-white/60">
            {viewMode === "list"
              ? "Manage all active institutions on the platform"
              : editingInstitution
                ? "Edit institution details"
                : "Add a new institution to the platform"}
          </p>
        </div>

        {viewMode === "list" ? (
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#00A8E8] to-[#007EA7] hover:from-[#00A8E8] hover:to-[#00A8E8] text-white rounded-xl shadow-lg shadow-[#00A8E8]/20 transition-all duration-300 hover:-translate-y-0.5 font-bold text-sm w-fit"
          >
            <FiPlus size={18} />
            <span>Add Institution</span>
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
          ) : institutions.length > 0 ? (
            institutions.map((inst, idx) => (
              <div
                key={inst._id}
                className={`bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 p-6 rounded-[2rem] shadow-soft flex flex-col items-start gap-4 transition-all duration-300 hover:shadow-xl hover:border-[#00A8E8]/30 animate-fade-in-up`}
                style={{
                  animationDelay: `${200 + idx * 100}ms`,
                  animationFillMode: "both",
                }}
              >
                <div className="flex items-center gap-4 w-full">
                  <div className="w-14 h-14 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center shadow-inner text-xl font-bold">
                    {inst.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h3
                      className="font-bold text-lg text-[#1C1E21] dark:text-white truncate"
                      title={inst.name}
                    >
                      {inst.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-[#9CA3AF] dark:text-white/50 mt-1">
                      <FiHash size={12} />
                      <span>{inst.code}</span>
                    </div>
                  </div>
                </div>

                <div className="w-full bg-black/5 dark:bg-white/5 h-px my-2"></div>

                {/* Optional Info */}
                <div className="w-full space-y-2 mb-4 flex-1">
                  {inst.address && (
                    <div className="flex items-start gap-2 text-sm text-[#4B5563] dark:text-white/70">
                      <FiMapPin
                        size={16}
                        className="mt-0.5 shrink-0 opacity-60"
                      />
                      <span className="truncate">{inst.address}</span>
                    </div>
                  )}
                  {inst.website && (
                    <div className="flex items-start gap-2 text-sm text-[#4B5563] dark:text-white/70">
                      <FiGlobe
                        size={16}
                        className="mt-0.5 shrink-0 opacity-60"
                      />
                      <a
                        href={
                          inst.website.startsWith("http")
                            ? inst.website
                            : `https://${inst.website}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="truncate hover:text-[#00A8E8] transition-colors"
                      >
                        {inst.website}
                      </a>
                    </div>
                  )}
                  {!inst.address && !inst.website && (
                    <div className="text-sm text-[#9CA3AF] dark:text-white/40 italic">
                      No additional details provided.
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleEdit(inst)}
                  className="w-full py-2.5 rounded-xl border border-[#00A8E8]/20 text-[#00A8E8] font-bold text-sm bg-[#00A8E8]/5 hover:bg-[#00A8E8]/10 transition-colors flex items-center justify-center gap-2"
                >
                  <FiEdit3 size={16} />
                  <span>Edit Institution</span>
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[2rem]">
              <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                <FiBook
                  size={32}
                  className="text-gray-400 dark:text-white/30"
                />
              </div>
              <h3 className="text-xl font-bold text-[#1C1E21] dark:text-white mb-2">
                No Institutions Found
              </h3>
              <p className="text-[#4B5563] dark:text-white/60 text-center max-w-sm mb-6">
                There are currently no active institutions in the system. Get
                started by creating the first one.
              </p>
              <button
                onClick={handleAddNew}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00A8E8] to-[#007EA7] hover:from-[#00A8E8] hover:to-[#00A8E8] text-white rounded-xl shadow-lg shadow-[#00A8E8]/20 transition-all font-bold"
              >
                <FiPlus size={20} />
                <span>Create First Institution</span>
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
                Institution Name *
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#00A8E8] transition-colors">
                  <FiBook size={18} />
                </div>
                <input
                  type="text"
                  placeholder="e.g. Stanford University"
                  value={institutionForm.name}
                  onChange={(e) =>
                    setInstitutionForm({
                      ...institutionForm,
                      name: e.target.value,
                    })
                  }
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#00171F]/80 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#00A8E8]/50 outline-none transition-all text-[#1C1E21] dark:text-white placeholder-gray-400 dark:placeholder-white/30"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-[#4B5563] dark:text-white/80 ml-1">
                Institution Code *
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#00A8E8] transition-colors">
                  <FiHash size={18} />
                </div>
                <input
                  type="text"
                  placeholder="e.g. STAN-01"
                  value={institutionForm.code}
                  onChange={(e) =>
                    setInstitutionForm({
                      ...institutionForm,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#00171F]/80 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#00A8E8]/50 outline-none transition-all text-[#1C1E21] dark:text-white placeholder-gray-400 dark:placeholder-white/30"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-bold text-[#4B5563] dark:text-white/80 ml-1">
                Physical Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#00A8E8] transition-colors">
                  <FiMapPin size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Enter full street address"
                  value={institutionForm.address}
                  onChange={(e) =>
                    setInstitutionForm({
                      ...institutionForm,
                      address: e.target.value,
                    })
                  }
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#00171F]/80 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#00A8E8]/50 outline-none transition-all text-[#1C1E21] dark:text-white placeholder-gray-400 dark:placeholder-white/30"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-bold text-[#4B5563] dark:text-white/80 ml-1">
                Official Website
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#00A8E8] transition-colors">
                  <FiGlobe size={18} />
                </div>
                <input
                  type="text"
                  placeholder="https://www.institution.com"
                  value={institutionForm.website}
                  onChange={(e) =>
                    setInstitutionForm({
                      ...institutionForm,
                      website: e.target.value,
                    })
                  }
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#00171F]/80 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#00A8E8]/50 outline-none transition-all text-[#1C1E21] dark:text-white placeholder-gray-400 dark:placeholder-white/30"
                />
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col md:flex-row items-center gap-4 justify-end border-t border-black/5 dark:border-white/10 pt-6">
            <button
              onClick={() => setViewMode("list")}
              disabled={loading}
              className="w-full md:w-auto px-6 py-3 rounded-xl border border-black/10 dark:border-white/10 text-[#4B5563] dark:text-white/80 font-bold hover:bg-[#F8FAFC] dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <FiX size={18} />
              <span>Discard Changes</span>
            </button>

            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full md:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-[#00A8E8] to-[#007EA7] hover:from-[#00A8E8] hover:to-[#00A8E8] text-white font-bold shadow-lg shadow-[#00A8E8]/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Processing...
                </span>
              ) : editingInstitution ? (
                <>
                  <FiCheck size={18} />
                  <span>Update Profile</span>
                </>
              ) : (
                <>
                  <FiPlus size={18} />
                  <span>Create Profile</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstitutionTab;
