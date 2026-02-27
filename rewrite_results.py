import sys
import re

with open('c:/Users/HK/Desktop/CPRS/client/src/pages/common/Results.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# We want to replace everything from `  if (!result)` to the end of the file.
new_ui = """  if (!result)
    return (
      <div className="relative flex min-h-screen bg-surface dark:bg-[#00171F] font-sans overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#00A8E8]/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-50 dark:opacity-100"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#007EA7]/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-50 dark:opacity-100"></div>
          <div className="absolute top-[40%] left-[60%] w-[400px] h-[400px] bg-[#00A8E8]/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen opacity-50 dark:opacity-100"></div>
          <div className="absolute inset-0 z-0 overflow-hidden opacity-20 hidden md:block">
            <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="dashboard-grid" w="40" h="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-black/[0.1] dark:text-white/20"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dashboard-grid)" />
            </svg>
          </div>
        </div>
        <div className="relative z-10 flex w-full">
          <StudentSidebar />
          <main className="flex-1 p-6 md:p-10 md:ml-72 max-w-7xl mx-auto w-full pt-[40px] md:pt-10 flex items-center justify-center">
            <div className="bg-white/60 dark:bg-[#00171F]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-3xl p-8 shadow-soft text-center">
              <p className="text-lg text-[#4B5563] dark:text-white/60 font-medium">No results found. Complete an assessment to see analytics.</p>
            </div>
          </main>
        </div>
      </div>
    );

  const categoryScores = Array.isArray(result.categoryScores) ? result.categoryScores : [];
  const chartData = {
    labels: categoryScores.map((c) => c.category),
    datasets: [
      {
        label: "Mastery %",
        data: categoryScores.map((c) => c.percentage),
        backgroundColor: ["#00A8E8", "#007EA7", "#10b981", "#f59e0b", "#7c3aed"],
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
      },
    ],
  };

  return (
    <div className="relative flex min-h-screen bg-surface dark:bg-[#00171F] font-sans overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#00A8E8]/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-50 dark:opacity-100"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#007EA7]/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-50 dark:opacity-100"></div>
        <div className="absolute top-[40%] left-[60%] w-[400px] h-[400px] bg-[#00A8E8]/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen opacity-50 dark:opacity-100"></div>
        <div className="absolute inset-0 z-0 overflow-hidden opacity-20 hidden md:block">
          <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dashboard-grid" w="40" h="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-black/[0.1] dark:text-white/20"/>
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
              <h1 className="text-2xl md:text-4xl font-display font-black text-[#1C1E21] dark:text-white tracking-tight mb-2 drop-shadow-sm">
                Global Results
              </h1>
              <p className="text-sm text-[#4B5563] dark:text-white/60 font-medium">
                Detailed insights into your performance standing.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleRetake} className="p-3 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-[#1C1E21] dark:text-white shadow-soft" title="Recalibrate">
                <HiOutlineRefresh size={20} />
              </button>
              <button onClick={handleShare} className="p-3 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-[#1C1E21] dark:text-white shadow-soft" title="Share">
                <HiOutlineShare size={20} />
              </button>
              <button onClick={handleDownloadPDF} className="px-5 py-3 bg-gradient-to-r from-[#00A8E8] to-[#007EA7] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                <HiOutlineDownload size={20} />
                Download Report
              </button>
            </div>
          </div>
          <div className="bg-white/60 dark:bg-[#00171F]/50 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[2rem] p-6 md:p-10 shadow-soft relative overflow-hidden" ref={reportRef}>
            <div className="text-center mb-12 relative z-10 animate-fade-in-up">
              <div className="inline-flex items-center justify-center p-4 bg-[#00A8E8]/10 rounded-2xl mb-4 text-[#00A8E8]">
                <HiOutlineSparkles className="text-3xl" />
              </div>
              <h2 className="text-3xl md:text-5xl font-display font-black text-[#1C1E21] dark:text-white mb-3">
                Career Fitment: <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00A8E8] to-[#007EA7]">{result.targetDomain}</span>
              </h2>
              <p className="text-[#4B5563] dark:text-white/60 font-medium inline-block px-5 py-2 bg-black/5 dark:bg-white/5 rounded-full text-sm border border-black/5 dark:border-white/10 shadow-inner">
                Education Level: {result.educationLevel}
              </p>
            </div>
            {result.explanations && result.explanations.length > 0 && (
              <div className="bg-gradient-to-br from-[#00A8E8]/10 to-[#007EA7]/10 dark:from-[#00A8E8]/5 dark:to-[#007EA7]/5 rounded-3xl p-8 mb-12 shadow-inner border border-[#00A8E8]/20 dark:border-[#00A8E8]/10 relative overflow-hidden animate-fade-in-up delay-[150ms]">
                <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-10 text-[#00A8E8]">
                  <HiOutlineLightBulb className="text-8xl" />
                </div>
                <h3 className="text-xl font-display font-black text-[#1C1E21] dark:text-white mb-6 flex items-center gap-3 relative z-10">
                  <div className="p-2 bg-[#00A8E8] text-white rounded-xl shadow-md">
                    <HiOutlineSparkles size={20} />
                  </div>
                  AI Combinatorial Insights
                </h3>
                <div className="space-y-4 relative z-10">
                  {result.explanations.map((exp, idx) => (
                    <div key={idx} className="flex gap-4 items-start bg-white/60 dark:bg-white/5 p-5 rounded-2xl backdrop-blur-md border border-white/50 dark:border-white/10 shadow-soft hover:shadow-soft-xl transition-all">
                      <div className="w-8 h-8 rounded-full bg-[#00A8E8]/20 text-[#007EA7] dark:text-[#00A8E8] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                        <span className="font-bold text-sm">{idx + 1}</span>
                      </div>
                      <p className="text-[#1C1E21] dark:text-white/90 font-medium leading-relaxed">
                        {exp}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="bg-[#10b981]/5 dark:bg-[#10b981]/5 rounded-3xl p-6 border border-[#10b981]/20 dark:border-[#10b981]/10 flex flex-col gap-4 shadow-soft animate-fade-in-up delay-[300ms] group hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#10b981]/20 rounded-xl group-hover:scale-110 transition-transform">
                    <HiOutlineCheckCircle className="text-2xl text-[#10b981] shrink-0" />
                  </div>
                  <h4 className="font-bold font-display text-[#10b981] text-xl">
                    Why You Fit
                  </h4>
                </div>
                <p className="text-[#4B5563] dark:text-white/80 text-sm leading-relaxed p-5 bg-white/80 dark:bg-black/20 rounded-xl border border-black/5 dark:border-white/5 grow shadow-inner">
                  {result.fitReasoning || "Your strengths align with the core requirements of this field."}
                </p>
              </div>
              <div className="bg-amber-500/5 dark:bg-amber-500/5 rounded-3xl p-6 border border-amber-500/20 dark:border-amber-500/10 flex flex-col gap-4 shadow-soft animate-fade-in-up delay-[450ms] group hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-500/20 rounded-xl group-hover:scale-110 transition-transform">
                    <HiOutlineExclamationCircle className="text-2xl text-amber-500 shrink-0" />
                  </div>
                  <h4 className="font-bold font-display text-amber-600 dark:text-amber-500 text-xl">
                    Potential Gaps
                  </h4>
                </div>
                <p className="text-[#4B5563] dark:text-white/80 text-sm leading-relaxed p-5 bg-white/80 dark:bg-black/20 rounded-xl border border-black/5 dark:border-white/5 grow shadow-inner">
                  {result.gapReasoning || "Focus on the categories listed below to bridge the skill gap."}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 p-6 md:p-8 bg-white/40 dark:bg-white/5 rounded-3xl border border-black/5 dark:border-white/10 shadow-soft animate-fade-in-up delay-[600ms]">
              <section>
                <h3 className="flex items-center gap-2 font-display font-black text-[#1C1E21] dark:text-white mb-6 text-xl">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 rounded-lg">
                    <HiOutlineLightningBolt size={20} />
                  </div>
                  Foundational Strengths
                </h3>
                <div className="flex flex-wrap gap-3">
                  {(result.strengths || []).map((s, idx) => (
                    <span key={idx} className="px-4 py-2 bg-white/80 dark:bg-[#00171F]/80 rounded-xl border border-black/5 dark:border-white/10 shadow-sm text-[#1C1E21] dark:text-white/90 font-bold text-sm flex items-center gap-2 backdrop-blur-md">
                      <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                      {s}
                    </span>
                  ))}
                </div>
              </section>
              <section>
                <h3 className="flex items-center gap-2 font-display font-black text-[#1C1E21] dark:text-white mb-6 text-xl">
                  <div className="p-2 bg-amber-50 dark:bg-amber-500/10 text-amber-500 dark:text-amber-400 rounded-lg">
                    <HiOutlineAcademicCap size={20}/>
                  </div>
                  Derived Combinatorial Roles
                </h3>
                <div className="flex flex-wrap gap-3">
                  {(result.recommendedCareers || []).map((c, idx) => (
                    <span key={idx} className="px-4 py-2 bg-white/80 dark:bg-[#00171F]/80 rounded-xl border border-black/5 dark:border-white/10 shadow-sm text-[#1C1E21] dark:text-white/90 font-bold text-sm flex items-center gap-2 backdrop-blur-md">
                      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      {c}
                    </span>
                  ))}
                </div>
              </section>
            </div>
            {result.weaknesses && result.weaknesses.length > 0 && (
              <div className="mb-12 animate-fade-in-up delay-[750ms]">
                <h3 className="flex items-center gap-3 font-display font-black text-[#1C1E21] dark:text-white mb-6 text-xl px-2">
                  <div className="p-2 bg-rose-50 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400 rounded-lg">
                    <HiOutlineTrendingUp size={20} />
                  </div>
                  Targeted Remediation Areas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {result.weaknesses.map((w, idx) => (
                    <div key={idx} className="bg-white/60 dark:bg-white/5 p-6 rounded-3xl border border-black/5 dark:border-white/10 shadow-soft hover:shadow-soft-xl transition-all flex flex-col backdrop-blur-md">
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-extrabold text-rose-600 dark:text-rose-400 uppercase text-xs tracking-wider bg-rose-50 dark:bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-100 dark:border-rose-500/20">
                          {w.category}
                        </span>
                      </div>
                      <p className="text-[#1C1E21] dark:text-white/90 text-[15px] mb-5 font-bold leading-relaxed">
                        {w.reason}
                      </p>
                      <div className="space-y-3 mt-auto">
                        {(w.improvementTips || []).map((tip, tIdx) => (
                          <div key={tIdx} className="flex gap-3 items-start text-xs font-medium text-[#4B5563] dark:text-white/70 bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-black/5 dark:border-white/5 shadow-inner">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1 shrink-0"></div>
                            <span className="leading-relaxed">{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {categoryScores.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 animate-fade-in-up delay-[900ms]">
                <div className="bg-[#F8FAFC] dark:bg-white/5 rounded-3xl p-6 md:p-8 border border-black/5 dark:border-white/10 shadow-inner relative h-[380px] flex flex-col hover:shadow-soft-xl transition-all">
                  <div className="flex items-center gap-2 mb-6 justify-center bg-black/5 dark:bg-white/5 py-2 px-4 rounded-full mx-auto w-fit">
                    <HiOutlineChartBar className="text-[#00A8E8]" size={18} />
                    <h4 className="text-[#1C1E21] dark:text-white font-bold text-xs uppercase tracking-widest">
                      Cognitive Distribution
                    </h4>
                  </div>
                  <div className="flex-1 relative w-full h-full min-h-0">
                    <Pie data={chartData} options={{ ...commonOptions, plugins: { ...commonOptions.plugins, legend: { ...commonOptions.plugins.legend, labels: { color: 'rgba(156, 163, 175, 1)' } } }, maintainAspectRatio: false }} />
                  </div>
                </div>
                <div className="bg-[#F8FAFC] dark:bg-white/5 rounded-3xl p-6 md:p-8 border border-black/5 dark:border-white/10 shadow-inner relative h-[380px] flex flex-col hover:shadow-soft-xl transition-all">
                  <div className="flex items-center gap-2 mb-6 justify-center bg-black/5 dark:bg-white/5 py-2 px-4 rounded-full mx-auto w-fit">
                    <HiOutlineChartBar className="text-[#00A8E8]" size={18} />
                    <h4 className="text-[#1C1E21] dark:text-white font-bold text-xs uppercase tracking-widest">
                      Absolute Performance
                    </h4>
                  </div>
                  <div className="flex-1 relative w-full h-full min-h-0">
                    <Bar data={chartData} options={{ ...barOptions, scales: { ...barOptions.scales, y: { ...barOptions.scales.y, ticks: { color: 'rgba(156, 163, 175, 1)' } }, x: { ...barOptions.scales.x, ticks: { color: 'rgba(156, 163, 175, 1)' } } }, maintainAspectRatio: false }} />
                  </div>
                </div>
              </div>
            )}
            <div className="border border-black/5 dark:border-white/10 text-center bg-white/80 dark:bg-white/5 backdrop-blur-md rounded-[2rem] p-10 shadow-soft animate-fade-in-up delay-[1050ms]">
              <div className="flex justify-center items-center gap-2 text-[#4B5563] dark:text-white/60 text-sm font-bold mb-4">
                <div className="p-2 bg-black/5 dark:bg-white/10 rounded-lg text-[#00A8E8]">
                  <HiOutlineClock size={16} />
                </div>
                <span>
                  Assessment Duration: <span className="text-[#1C1E21] dark:text-white">{Math.floor(result.timeSpent / 60)}m {result.timeSpent % 60}s</span>
                </span>
              </div>
              <p className="text-[#1C1E21] dark:text-white/60 font-bold mb-2 uppercase tracking-widest text-sm">
                Overall Readiness Score
              </p>
              <strong className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00A8E8] to-[#007EA7] tracking-tight drop-shadow-md">
                {result.overallPercentage || 0}%
              </strong>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Results;
"""

idx = content.find('  if (!result)')
if idx != -1:
    new_content = content[:idx] + new_ui
    with open('c:/Users/HK/Desktop/CPRS/client/src/pages/common/Results.jsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Done")
else:
    print("Not found")

