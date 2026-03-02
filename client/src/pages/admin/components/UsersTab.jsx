import { useState, useEffect } from "react";
import {
  FiUsers,
  FiSearch,
  FiChevronRight,
  FiUser,
  FiMail,
  FiCalendar,
  FiAward,
  FiArrowLeft,
  FiClock,
  FiTarget,
} from "react-icons/fi";
import {
  fetchInstitutionStudents,
  fetchStudentDetails,
} from "../../../services/adminApi";
import GlobalLoader from "../../../components/GlobalLoader";

const UsersTab = () => {
  const [students, setStudents] = useState([]);
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      // Fetch students and institution info (if any)
      const studentData = await fetchInstitutionStudents();
      if (studentData.success) {
        setStudents(studentData.students);
      }

      // We can also try getting the institution details to show context
      try {
        const { getMyInstitution } =
          await import("../../../services/institutionApi");
        const instRes = await getMyInstitution();
        setInstitution(instRes.institution);
      } catch (e) {
        console.warn("Could not load institution details for context");
      }
    } catch (err) {
      toast.error(err.message || "Failed to load users page");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    // Keep this for manual refreshes if needed, but loadInitialData handles it now
    loadInitialData();
  };

  const fetchDetails = async (studentId) => {
    try {
      setDetailsLoading(true);
      const data = await fetchStudentDetails(studentId);
      if (data.success) {
        setStudentDetails(data);
      } else {
        toast.error(data.message || "Failed to load student details");
      }
    } catch (err) {
      toast.error(err.message || "Failed to load student details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    fetchDetails(student._id);
  };

  const handleBack = () => {
    setSelectedStudent(null);
    setStudentDetails(null);
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading && !selectedStudent) return <GlobalLoader />;

  return (
    <div className="animate-fade-in-up">
      {selectedStudent ? (
        <div className="space-y-6 pb-20">
          {/* Header with Back button */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={handleBack}
              className="p-2.5 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-[#1C1E21] dark:text-white shadow-soft"
            >
              <FiArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-2xl font-display font-black text-[#1C1E21] dark:text-white tracking-tight">
                Student Profile
              </h2>
              <p className="text-sm text-[#4B5563] dark:text-white/60 font-medium">
                Detailed view of {selectedStudent.name}
              </p>
            </div>
          </div>

          {detailsLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-[#00A8E8]/20 border-t-[#00A8E8] rounded-full animate-spin"></div>
            </div>
          ) : studentDetails ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Profile Card */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white/60 dark:bg-[#00171F]/50 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[2rem] p-8 shadow-soft overflow-hidden relative group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <FiUser size={120} className="text-[#00A8E8]" />
                  </div>

                  <div className="relative z-10 text-center">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#00A8E8] to-[#007EA7] flex items-center justify-center text-white text-4xl font-black shadow-lg mx-auto mb-6">
                      {studentDetails.student.name.charAt(0)}
                    </div>
                    <h3 className="text-2xl font-black text-[#1C1E21] dark:text-white mb-1">
                      {studentDetails.student.name}
                    </h3>
                    <p className="text-[#4B5563] dark:text-white/60 font-medium mb-6">
                      {studentDetails.student.email}
                    </p>

                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                      {studentDetails.student.role === "campus_student"
                        ? "Campus Student"
                        : "Student"}
                    </div>
                  </div>

                  <div className="mt-8 space-y-4 pt-8 border-t border-black/5 dark:border-white/10">
                    <div className="flex items-center gap-3">
                      <FiCalendar className="text-[#00A8E8]" size={18} />
                      <div className="text-left leading-none">
                        <p className="text-[10px] uppercase font-bold text-[#9CA3AF] tracking-wider mb-0.5">
                          Joined
                        </p>
                        <p className="text-sm font-bold text-[#1C1E21] dark:text-white/90">
                          {new Date(
                            studentDetails.student.createdAt,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <FiAward className="text-[#00A8E8]" size={18} />
                      <div className="text-left leading-none">
                        <p className="text-[10px] uppercase font-bold text-[#9CA3AF] tracking-wider mb-0.5">
                          Profile Status
                        </p>
                        <p className="text-sm font-bold text-[#1C1E21] dark:text-white/90">
                          {studentDetails.student.isProfileComplete
                            ? "Completed"
                            : "Incomplete"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Assessment Results */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white/60 dark:bg-[#00171F]/50 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[2rem] p-6 md:p-8 shadow-soft h-full">
                  <h3 className="text-xl font-display font-black text-[#1C1E21] dark:text-white mb-8 flex items-center gap-3">
                    <div className="p-2.5 bg-[#00A8E8]/10 text-[#00A8E8] rounded-xl border border-[#00A8E8]/20">
                      <FiAward size={20} />
                    </div>
                    Assessment History
                  </h3>

                  {studentDetails.results &&
                  studentDetails.results.length > 0 ? (
                    <div className="space-y-4">
                      {studentDetails.results.map((res) => (
                        <div
                          key={res._id}
                          className="group relative overflow-hidden bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl p-5 hover:border-[#00A8E8]/30 transition-all duration-300"
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                                    res.assessmentType === "Batch Test"
                                      ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20"
                                      : "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20"
                                  }`}
                                >
                                  {res.assessmentType}
                                </span>
                                <span className="text-[10px] font-bold text-[#9CA3AF] uppercase">
                                  {new Date(res.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <h4 className="text-lg font-black text-[#1C1E21] dark:text-white">
                                {res.batchName || res.targetDomain}
                              </h4>
                              <div className="flex items-center gap-4 pt-1">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-[#4B5563] dark:text-white/50">
                                  <FiTarget
                                    size={14}
                                    className="text-[#00A8E8]"
                                  />
                                  {res.targetDomain}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-[#4B5563] dark:text-white/50">
                                  <FiClock
                                    size={14}
                                    className="text-[#00A8E8]"
                                  />
                                  {Math.floor(res.timeSpent / 60)}m
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-6">
                              <div className="text-right">
                                <p className="text-[10px] uppercase font-black text-[#9CA3AF] tracking-widest mb-0.5">
                                  Score
                                </p>
                                <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00A8E8] to-[#007EA7]">
                                  {res.overallPercentage}%
                                </p>
                              </div>
                              <a
                                href={`/results/${res._id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 bg-gradient-to-r from-[#00A8E8] to-[#007EA7] text-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
                              >
                                <FiChevronRight size={20} />
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-white/40 dark:bg-white/5 rounded-[2rem] border border-dashed border-black/10 dark:border-white/10">
                      <FiAward className="text-4xl text-[#9CA3AF] mx-auto mb-4 opacity-50" />
                      <p className="text-[#4B5563] dark:text-white/40 font-medium font-display">
                        No assessment attempts recorded yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-black text-[#1C1E21] dark:text-white tracking-tight">
                User Management
              </h2>
              <p className="text-sm text-[#4B5563] dark:text-white/60 font-medium">
                {institution
                  ? `Monitoring all students for ${institution.name}`
                  : "Monitor and manage all students in your institution"}
              </p>
            </div>

            <div className="relative group w-full md:w-80">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] group-focus-within:text-[#00A8E8] transition-colors" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00A8E8]/50 focus:border-[#00A8E8] transition-all text-[#1C1E21] dark:text-white placeholder:text-[#9CA3AF]"
              />
            </div>
          </div>

          <div className="bg-white/60 dark:bg-[#00171F]/50 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-white/40 dark:bg-white/5 border-b border-black/5 dark:border-white/10">
                    <th className="px-8 py-5 text-left text-[11px] font-black uppercase tracking-widest text-[#9CA3AF]">
                      Student
                    </th>
                    <th className="px-8 py-5 text-left text-[11px] font-black uppercase tracking-widest text-[#9CA3AF]">
                      Role
                    </th>
                    <th className="px-8 py-5 text-left text-[11px] font-black uppercase tracking-widest text-[#9CA3AF]">
                      Profile
                    </th>
                    <th className="px-8 py-5 text-left text-[11px] font-black uppercase tracking-widest text-[#9CA3AF]">
                      Status
                    </th>
                    <th className="px-8 py-5 text-right text-[11px] font-black uppercase tracking-widest text-[#9CA3AF]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((s) => (
                      <tr
                        key={s._id}
                        className="group hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00A8E8] to-[#007EA7] flex items-center justify-center text-white text-base font-black shadow-md">
                              {s.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-[#1C1E21] dark:text-white group-hover:text-[#00A8E8] transition-colors">
                                {s.name}
                              </p>
                              <p className="text-xs text-[#9CA3AF] font-medium">
                                {s.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="inline-flex items-center px-3 py-1 bg-white dark:bg-white/10 rounded-lg border border-black/5 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-[#4B5563] dark:text-white/70">
                            {s.role.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div
                            className={`flex items-center gap-2 text-xs font-bold ${s.isProfileComplete ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${s.isProfileComplete ? "bg-emerald-500" : "bg-amber-500"}`}
                            ></div>
                            {s.isProfileComplete ? "Complete" : "Incomplete"}
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-xs font-bold text-[#4B5563] dark:text-white/60">
                            {s.batchId
                              ? `Enrolled: ${s.batchId}`
                              : "Not Enrolled"}
                          </p>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button
                            onClick={() => handleStudentClick(s)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#00A8E8]/10 text-[#00A8E8] font-bold text-xs uppercase tracking-widest rounded-lg border border-[#00A8E8]/20 hover:bg-[#00A8E8] hover:text-white transition-all shadow-sm"
                          >
                            View Details
                            <FiChevronRight />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center">
                          <FiUsers className="text-4xl text-[#9CA3AF] mb-4 opacity-50" />
                          <p className="text-lg font-display font-black text-[#1C1E21] dark:text-white opacity-50 mb-2">
                            {searchTerm
                              ? "No users match your search"
                              : "No users found"}
                          </p>
                          {!institution && !searchTerm && (
                            <p className="text-sm text-[#4B5563] dark:text-white/40 font-medium max-w-sm mx-auto">
                              It looks like your account isn't linked to an
                              active institution. Please go to the{" "}
                              <strong className="text-[#00A8E8]">
                                Institution
                              </strong>{" "}
                              tab to set up or verify your details.
                            </p>
                          )}
                          {institution &&
                            !searchTerm &&
                            students.length === 0 && (
                              <p className="text-sm text-[#4B5563] dark:text-white/40 font-medium max-w-sm mx-auto">
                                Students can join your institution using the
                                code:{" "}
                                <strong className="text-[#00A8E8]">
                                  {institution.code}
                                </strong>
                                . Once they join, they will appear in this list.
                              </p>
                            )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTab;
