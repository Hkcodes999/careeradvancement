import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAllMyResults } from "../../services/resultApi";
import StudentSidebar from "../../components/StudentSidebar";
import GlobalLoader from "../../components/GlobalLoader";
import {
  HiOutlineSparkles,
  HiOutlineCalendar,
  HiOutlineArrowRight,
  HiOutlineChartBar,
} from "react-icons/hi";

const StudentResultsHistory = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchAllMyResults();
        if (res && res.success) {
          setResults(res.results || []);
        }
      } catch (err) {
        console.error("Failed to load results history", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <GlobalLoader />;

  return (
    <div className="relative flex min-h-screen bg-surface dark:bg-[#00171F] font-sans overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#00A8E8]/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-50 dark:opacity-100"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#007EA7]/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-50 dark:opacity-100"></div>
        <div className="absolute top-[40%] left-[60%] w-[400px] h-[400px] bg-[#00A8E8]/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen opacity-50 dark:opacity-100"></div>
        {/* Grid Overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden opacity-20 hidden md:block">
          <svg
            className="absolute w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="dashboard-grid"
                w="40"
                h="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-black/[0.1] dark:text-white/20"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dashboard-grid)" />
          </svg>
        </div>
      </div>

      <div className="relative z-10 flex w-full">
        <StudentSidebar />

        <main className="flex-1 p-6 md:p-10 md:ml-72 max-w-7xl mx-auto w-full pt-[40px] md:pt-10 mb-20">
          <div className="animate-fade-in-up mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <h1 className="text-2xl md:text-5xl font-display font-black text-[#1C1E21] dark:text-white tracking-tight mb-2 drop-shadow-sm flex items-center gap-4">
                <div className="p-3 bg-white/60 dark:bg-white/10 rounded-2xl shadow-soft">
                  <HiOutlineChartBar className="text-[#00A8E8]" />
                </div>
                Assessment History
              </h1>
              <p className="text-sm md:text-base text-[#4B5563] dark:text-white/60 font-medium max-w-xl leading-relaxed mt-4">
                Review your past assessments and track your readiness journey
                over time. Click on any result card to view a detailed breakdown
                of your combinatorial fit.
              </p>
            </div>
          </div>

          {!results || results.length === 0 ? (
            <div className="bg-white/60 dark:bg-[#00171F]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-3xl p-12 md:p-20 shadow-soft text-center animate-fade-in-up relative overflow-hidden">
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#00A8E8]/5 to-transparent border-b-4 border-[#00A8E8]/20" />
              <div className="inline-flex items-center justify-center p-6 bg-[#00A8E8]/10 rounded-full mb-6 relative">
                <HiOutlineSparkles className="text-5xl text-[#00A8E8]" />
                <div className="absolute inset-0 bg-[#00A8E8] rounded-full blur-xl opacity-20 motion-safe:animate-pulse"></div>
              </div>
              <h2 className="text-2xl font-bold text-[#1C1E21] dark:text-white mb-3">
                No Assessments Completed Yet
              </h2>
              <p className="text-[#4B5563] dark:text-white/60 text-lg mb-8 max-w-md mx-auto">
                Discover your strengths and get AI-driven career recommendations
                by completing your first assessment.
              </p>
              <Link
                to="/assessment"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#00A8E8] hover:bg-[#007EA7] text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-[#00A8E8]/30 group"
              >
                <span>Take Assessment Now</span>
                <HiOutlineArrowRight className="transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 relative z-10">
              {results.map((item, index) => {
                const dateString = new Date(item.createdAt).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  },
                );
                const isLatest = index === 0;

                return (
                  <Link
                    key={item._id}
                    to={`/results/${item._id}`}
                    className={`block group bg-white/60 dark:bg-[#00171F]/50 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-soft hover:shadow-xl hover:border-[#00A8E8]/30 transition-all duration-300 animate-fade-in-up ${isLatest ? "md:col-span-2 xl:col-span-2 bg-gradient-to-br from-white/80 to-[#00A8E8]/5 dark:from-[#00171F]/80 dark:to-[#00A8E8]/10" : ""}`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex flex-col h-full justify-between gap-6">
                      <div className="flex flex-wrap md:flex-nowrap justify-between items-start gap-4">
                        {isLatest && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-emerald-500/10 to-emerald-400/10 dark:from-emerald-500/20 dark:to-emerald-400/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-widest rounded-full border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            Latest Analysis
                          </span>
                        )}
                        <div className="flex items-center gap-2 text-[#4B5563] dark:text-white/50 text-xs font-bold uppercase tracking-wider ml-auto">
                          <HiOutlineCalendar size={16} />
                          {dateString}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <h2
                          className={`font-display font-black text-[#1C1E21] dark:text-white leading-tight ${isLatest ? "text-3xl lg:text-4xl" : "text-2xl"}`}
                        >
                          {item.targetDomain || "General Profile"}
                        </h2>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="px-3 py-1 bg-black/5 dark:bg-white/5 rounded-lg text-xs font-bold text-[#4B5563] dark:text-white/70 border border-black/5 dark:border-white/5 shadow-inner">
                            {item.educationLevel || "UG"}
                          </span>
                          <span className="px-3 py-1 bg-[#00A8E8]/10 dark:bg-[#00A8E8]/20 rounded-lg text-xs font-bold text-[#007EA7] dark:text-[#00A8E8] border border-[#00A8E8]/20 shadow-inner">
                            Attempt {item.attempt || 1}
                          </span>
                        </div>
                      </div>

                      <div className="mt-auto pt-6 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-[#4B5563] dark:text-white/50 font-bold uppercase tracking-widest mb-1">
                            Readiness Score
                          </p>
                          <div className="flex items-end gap-1">
                            <span
                              className={`font-black tracking-tighter ${isLatest ? "text-5xl text-transparent bg-clip-text bg-gradient-to-r from-[#00A8E8] to-[#007EA7]" : "text-4xl text-[#1C1E21] dark:text-white"}`}
                            >
                              {item.overallPercentage || 0}%
                            </span>
                          </div>
                        </div>

                        <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center group-hover:bg-[#00A8E8] group-hover:text-white transition-colors duration-300 text-[#4B5563] dark:text-white/60">
                          <HiOutlineArrowRight
                            size={20}
                            className="transform group-hover:translate-x-0.5 transition-transform"
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StudentResultsHistory;
