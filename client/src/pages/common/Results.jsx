import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Pie, Bar } from "react-chartjs-2";
import "chart.js/auto";
import {
  HiOutlineAcademicCap,
  HiOutlineLightningBolt,
  HiOutlineChartBar,
  HiOutlineClock,
  HiOutlineRefresh,
  HiOutlineShare,
  HiOutlineDownload,
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
  HiOutlineLightBulb,
  HiOutlineTrendingUp,
  HiOutlineSparkles,
} from "react-icons/hi";
import {
  FiTarget,
  FiAward,
  FiBook,
  FiBarChart2,
  FiArrowRight,
} from "react-icons/fi";
import jsPDF from "jspdf";
import {
  fetchResultById,
  fetchMyResult,
  resetAssessment,
} from "../../services/resultApi";
import GlobalLoader from "../../components/GlobalLoader";
import StudentSidebar from "../../components/StudentSidebar";

/* ============================================================
   SCORE RING — Animated SVG circular progress
============================================================ */
const ScoreRing = ({ score, size = 200, strokeWidth = 12 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s) => {
    if (s >= 80) return { from: "#10b981", to: "#059669" };
    if (s >= 60) return { from: "#00A8E8", to: "#007EA7" };
    if (s >= 40) return { from: "#f59e0b", to: "#d97706" };
    return { from: "#ef4444", to: "#dc2626" };
  };
  const color = getColor(score);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color.from} />
            <stop offset="100%" stopColor={color.to} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-black/5 dark:text-white/5"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#scoreGrad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl md:text-6xl font-black text-white dark:text-white tracking-tighter">
          {score}
          <span className="text-2xl text-[#4B5563] dark:text-white/50">%</span>
        </span>
        <span className="text-xs font-bold uppercase tracking-widest text-[#4B5563] dark:text-white/40 mt-1">
          Readiness
        </span>
      </div>
    </div>
  );
};

/* ============================================================
   CATEGORY PROGRESS BAR
============================================================ */
const CategoryBar = ({ category, correct, total, percentage, delay = 0 }) => {
  const getBarColor = (p) => {
    if (p >= 80) return "from-emerald-500 to-emerald-600";
    if (p >= 60) return "from-[#00A8E8] to-[#007EA7]";
    if (p >= 40) return "from-amber-500 to-amber-600";
    return "from-rose-500 to-rose-600";
  };

  return (
    <div
      className="animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-[#1C1E21] dark:text-white text-sm">
          {category}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-[#4B5563] dark:text-white/50">
            {correct}/{total} correct
          </span>
          <span
            className={`text-sm font-black ${percentage >= 60 ? "text-emerald-600 dark:text-emerald-400" : percentage >= 40 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"}`}
          >
            {percentage}%
          </span>
        </div>
      </div>
      <div className="w-full h-3 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getBarColor(percentage)} transition-all duration-1000 ease-out`}
          style={{
            width: `${percentage}%`,
            transitionDelay: `${delay + 300}ms`,
          }}
        />
      </div>
    </div>
  );
};

/* ============================================================
   STAT CARD COMPONENT
============================================================ */
const StatCard = ({ icon: Icon, label, value, color = "blue", subtext }) => {
  const colorMap = {
    blue: "bg-[#00A8E8]/10 text-[#007EA7] dark:text-[#00A8E8] border-[#00A8E8]/20",
    green:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    amber:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    purple:
      "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  };

  return (
    <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-2xl p-5 shadow-soft hover:shadow-soft-xl transition-all hover:-translate-y-0.5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2.5 rounded-xl border ${colorMap[color]}`}>
          <Icon size={18} />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-[#4B5563] dark:text-white/50">
          {label}
        </span>
      </div>
      <p className="text-2xl font-black text-[#1C1E21] dark:text-white tracking-tight">
        {value}
      </p>
      {subtext && (
        <p className="text-xs text-[#4B5563] dark:text-white/40 font-medium mt-1">
          {subtext}
        </p>
      )}
    </div>
  );
};

/* ============================================================
   MAIN RESULTS COMPONENT
============================================================ */
const Results = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        let res;
        if (id) {
          res = await fetchResultById(id);
        } else {
          res = await fetchMyResult();
        }

        if (!res || res.locked) {
          setResult(null);
        } else {
          setResult(res);
        }
      } catch {
        setResult(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  /* ================= CHART CONFIG ================= */
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 20,
          usePointStyle: true,
          font: { size: 12, weight: "bold" },
        },
      },
      tooltip: {
        backgroundColor: "#0f172a",
        padding: 14,
        bodySpacing: 6,
        bodyFont: { size: 13 },
        titleFont: { size: 14, weight: "bold" },
        cornerRadius: 12,
      },
    },
  };

  const barOptions = {
    ...commonOptions,
    plugins: { ...commonOptions.plugins, legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: { color: "rgba(0,0,0,0.03)" },
        ticks: { font: { size: 11, weight: "bold" }, color: "#9ca3af" },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11, weight: "bold" }, color: "#9ca3af" },
      },
    },
  };

  /* ================= PDF GENERATION ================= */
  const handleDownloadPDF = () => {
    if (!result) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let yPos = 0;

    const colors = {
      blue: [37, 99, 235],
      purple: [124, 58, 237],
      gold: [245, 158, 11],
      dark: [30, 41, 59],
      lightGray: [241, 245, 249],
      border: [226, 232, 240],
    };

    const drawHeader = () => {
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, 50, "F");
      doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
      doc.line(0, 50, pageWidth, 50);

      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("CAREER FITMENT REPORT", margin, 24);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(colors.purple[0], colors.purple[1], colors.purple[2]);
      doc.text("AI-DRIVEN COMPETENCY & DOMAIN INSIGHTS", margin, 30);
    };

    const addWrappedText = (
      text,
      fontSize = 11,
      style = "normal",
      color = colors.dark,
    ) => {
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", style);
      doc.setTextColor(color[0], color[1], color[2]);
      const lines = doc.splitTextToSize(
        text || "Information not available",
        contentWidth - 10,
      );

      if (yPos + lines.length * 6 > 280) {
        doc.addPage();
        yPos = 30;
      }
      doc.text(lines, margin + 5, yPos);
      yPos += lines.length * (fontSize / 1.8) + 4;
    };

    const drawSectionTitle = (title, accentColor) => {
      yPos += 12;
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.rect(margin, yPos - 5, contentWidth, 8, "F");

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text(title.toUpperCase(), margin + 5, yPos + 1);
      yPos += 10;
    };

    drawHeader();
    yPos = 65;

    doc.setFillColor(
      colors.lightGray[0],
      colors.lightGray[1],
      colors.lightGray[2],
    );
    doc.roundedRect(margin, yPos - 5, contentWidth, 35, 2, 2, "F");

    doc.setTextColor(colors.blue[0], colors.blue[1], colors.blue[2]);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(result.studentName || "User Name", margin + 8, yPos + 5);

    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Email: ${result.studentEmail || "N/A"}`, margin + 8, yPos + 12);
    doc.text(`Target Domain: ${result.targetDomain}`, margin + 8, yPos + 19);
    doc.text(`Level: ${result.educationLevel}`, margin + 8, yPos + 26);
    yPos += 45;

    drawSectionTitle("Assessment Reasoning", colors.purple);
    addWrappedText(result.fitReasoning);

    drawSectionTitle("Identified Skill Gaps", colors.gold);
    addWrappedText(result.gapReasoning);

    drawSectionTitle("Metric Breakdown", colors.blue);
    (result.categoryScores || []).forEach((cat) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 30;
      }

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      doc.text(cat.category, margin + 5, yPos);

      doc.setFillColor(235, 235, 240);
      doc.roundedRect(margin + 70, yPos - 3, 80, 3, 1, 1, "F");

      doc.setFillColor(colors.purple[0], colors.purple[1], colors.purple[2]);
      const barWidth = (cat.percentage / 100) * 80;
      doc.roundedRect(margin + 70, yPos - 3, barWidth, 3, 1, 1, "F");

      doc.setTextColor(colors.purple[0], colors.purple[1], colors.purple[2]);
      doc.text(`${cat.percentage}%`, margin + 155, yPos);

      yPos += 10;
    });

    drawSectionTitle("Career Recommendations", colors.purple);
    addWrappedText(
      `Recommended Roles: ${(result.recommendedCareers || []).join(" • ")}`,
      11,
      "bold",
      colors.blue,
    );

    yPos += 6;
    const bulletGutter = 12;

    (result.improvementSuggestions || []).forEach((tip) => {
      const textLines = doc.splitTextToSize(tip, contentWidth - bulletGutter);

      if (yPos + textLines.length * 6 > 280) {
        doc.addPage();
        yPos = 30;
      }

      doc.setFillColor(colors.gold[0], colors.gold[1], colors.gold[2]);
      doc.circle(margin + 6, yPos + 1.5, 0.8, "F");

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      doc.text(textLines, margin + bulletGutter, yPos + 2.5);

      yPos += textLines.length * 5.5 + 4;
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(180);
      doc.text(
        `Page ${i} of ${pageCount} | ${result.studentName} | Career Fitment Report`,
        pageWidth / 2,
        288,
        { align: "center" },
      );
    }

    doc.save(`Career_Report_${result.targetDomain}.pdf`);
  };

  /* ================= ACTION HANDLERS ================= */
  const handleShare = async () => {
    const shareData = {
      title: "My Career Assessment Results",
      text: `I evaluated my fit for ${result.targetDomain}. I scored ${result.overallPercentage}%!`,
      url: window.location.href,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const handleRetake = async () => {
    if (
      window.confirm(
        "This will permanently delete this result and let you choose a new target domain. Continue?",
      )
    ) {
      try {
        await resetAssessment();
        window.location.href = "/dashboard";
      } catch (err) {
        alert("Failed to reset assessment.");
      }
    }
  };

  if (loading) return <GlobalLoader />;

  if (!result)
    return (
      <div className="relative flex min-h-screen bg-surface dark:bg-[#00171F] font-sans overflow-hidden">
        <div className="relative z-10 flex w-full">
          <StudentSidebar />
          <main className="flex-1 p-6 md:p-10 md:ml-72 max-w-7xl mx-auto w-full pt-[40px] md:pt-10 flex items-center justify-center">
            <div className="bg-white/60 dark:bg-[#00171F]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-3xl p-8 shadow-soft text-center">
              <p className="text-lg text-[#4B5563] dark:text-white/60 font-medium">
                No results found. Complete an assessment to see analytics.
              </p>
            </div>
          </main>
        </div>
      </div>
    );

  const categoryScores = Array.isArray(result.categoryScores)
    ? result.categoryScores
    : [];

  const chartColors = [
    "#00A8E8",
    "#007EA7",
    "#10b981",
    "#f59e0b",
    "#7c3aed",
    "#ec4899",
  ];

  const chartData = {
    labels: categoryScores.map((c) => c.category),
    datasets: [
      {
        label: "Mastery %",
        data: categoryScores.map((c) => c.percentage),
        backgroundColor: chartColors.slice(0, categoryScores.length),
        borderWidth: 0,
        borderRadius: 6,
      },
    ],
  };

  const scoreLabel =
    result.overallPercentage >= 80
      ? "Excellent"
      : result.overallPercentage >= 60
        ? "Good"
        : result.overallPercentage >= 40
          ? "Developing"
          : "Needs Work";

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="relative flex min-h-screen bg-surface dark:bg-[#00171F] font-sans overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#00A8E8]/15 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-50 dark:opacity-100" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#007EA7]/15 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-50 dark:opacity-100" />
      </div>

      <div className="relative z-10 flex w-full">
        <StudentSidebar />
        <main className="flex-1 p-6 md:p-10 md:ml-72 max-w-7xl mx-auto w-full pt-[40px] md:pt-10 mb-20">
          {/* ==================== HEADER ==================== */}
          <div className="animate-fade-in-up mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl md:text-4xl font-display font-black text-[#1C1E21] dark:text-white tracking-tight mb-2">
                Assessment Results
              </h1>
              <p className="text-sm text-[#4B5563] dark:text-white/60 font-medium">
                Detailed AI-powered analysis of your performance
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRetake}
                className="p-3 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-[#1C1E21] dark:text-white shadow-soft"
                title="Recalibrate"
              >
                <HiOutlineRefresh size={20} />
              </button>
              <button
                onClick={handleShare}
                className="p-3 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-[#1C1E21] dark:text-white shadow-soft"
                title="Share"
              >
                <HiOutlineShare size={20} />
              </button>
              <button
                onClick={handleDownloadPDF}
                className="px-5 py-3 bg-gradient-to-r from-[#00A8E8] to-[#007EA7] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-95"
              >
                <HiOutlineDownload size={20} />
                Download Report
              </button>
            </div>
          </div>

          <div ref={reportRef}>
            {/* ==================== HERO SCORE SECTION ==================== */}
            <div className="bg-gradient-to-br from-[#00171F] to-[#003459] rounded-[2.5rem] p-8 md:p-12 mb-8 relative overflow-hidden border border-[#00A8E8]/20 shadow-2xl shadow-[#003459]/30 animate-fade-in-up">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00A8E8]/15 rounded-full translate-x-1/3 -translate-y-1/3 blur-[100px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#007EA7]/10 rounded-full -translate-x-1/3 translate-y-1/3 blur-[80px] pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                {/* Score Ring */}
                <ScoreRing score={result.overallPercentage || 0} />

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00A8E8]/20 border border-[#00A8E8]/30 rounded-full text-xs font-bold uppercase tracking-widest text-[#00A8E8] mb-4">
                    <FiTarget size={14} />
                    {result.assessmentType === "Batch Test"
                      ? "Batch Test"
                      : "Personal Assessment"}
                  </div>

                  <h2 className="text-3xl md:text-4xl font-display font-black text-white mb-2 tracking-tight">
                    {result.targetDomain}
                  </h2>

                  {result.batchName && (
                    <p className="text-white/50 text-sm font-medium mb-4">
                      Batch:{" "}
                      <span className="text-white/80 font-bold">
                        {result.batchName}
                      </span>
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-6">
                    <span className="px-3 py-1.5 bg-white/10 rounded-lg text-xs font-bold text-white/70 border border-white/10">
                      {result.educationLevel}
                    </span>
                    <span className="px-3 py-1.5 bg-white/10 rounded-lg text-xs font-bold text-white/70 border border-white/10">
                      Attempt {result.attempt || 1}
                    </span>
                    <span className="px-3 py-1.5 bg-white/10 rounded-lg text-xs font-bold text-white/70 border border-white/10">
                      {formatDate(result.createdAt)}
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 border border-white/10 rounded-xl">
                    <FiAward
                      className={`${result.overallPercentage >= 60 ? "text-emerald-400" : "text-amber-400"}`}
                      size={20}
                    />
                    <span className="text-white font-bold text-lg">
                      {scoreLabel}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ==================== QUICK STATS ROW ==================== */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-in-up delay-[150ms]">
              <StatCard
                icon={FiBarChart2}
                label="Overall Score"
                value={`${result.overallPercentage || 0}%`}
                color="blue"
                subtext={scoreLabel}
              />
              <StatCard
                icon={HiOutlineCheckCircle}
                label="Correct Answers"
                value={`${result.totalCorrect}/${result.totalQuestions}`}
                color="green"
                subtext={`${Math.round((result.totalCorrect / result.totalQuestions) * 100)}% accuracy`}
              />
              <StatCard
                icon={HiOutlineClock}
                label="Time Spent"
                value={`${Math.floor(result.timeSpent / 60)}m ${result.timeSpent % 60}s`}
                color="amber"
                subtext={`~${Math.round(result.timeSpent / result.totalQuestions)}s per question`}
              />
              <StatCard
                icon={FiTarget}
                label="Categories"
                value={categoryScores.length}
                color="purple"
                subtext={`${categoryScores.filter((c) => c.percentage >= 60).length} above 60%`}
              />
            </div>

            {/* ==================== CATEGORY BREAKDOWN ==================== */}
            {categoryScores.length > 0 && (
              <div className="bg-white/60 dark:bg-[#00171F]/50 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[2rem] p-6 md:p-8 shadow-soft mb-8 animate-fade-in-up delay-[300ms]">
                <h3 className="flex items-center gap-3 font-display font-black text-[#1C1E21] dark:text-white mb-8 text-xl">
                  <div className="p-2.5 bg-[#00A8E8]/10 text-[#00A8E8] rounded-xl border border-[#00A8E8]/20">
                    <HiOutlineChartBar size={20} />
                  </div>
                  Category Performance
                </h3>

                <div className="space-y-6 mb-8">
                  {categoryScores.map((cat, idx) => (
                    <CategoryBar
                      key={idx}
                      category={cat.category}
                      correct={cat.correct}
                      total={cat.total}
                      percentage={cat.percentage}
                      delay={idx * 100}
                    />
                  ))}
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-black/5 dark:border-white/10">
                  <div className="bg-[#F8FAFC] dark:bg-white/5 rounded-2xl p-6 border border-black/5 dark:border-white/10 h-[320px] flex flex-col">
                    <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-widest text-[#4B5563] dark:text-white/50">
                      <HiOutlineChartBar size={14} className="text-[#00A8E8]" />
                      Distribution
                    </div>
                    <div className="flex-1 min-h-0">
                      <Pie
                        data={chartData}
                        options={{
                          ...commonOptions,
                          plugins: {
                            ...commonOptions.plugins,
                            legend: {
                              ...commonOptions.plugins.legend,
                              labels: {
                                color: "#9ca3af",
                                usePointStyle: true,
                                padding: 16,
                                font: { size: 11, weight: "bold" },
                              },
                            },
                          },
                          maintainAspectRatio: false,
                        }}
                      />
                    </div>
                  </div>
                  <div className="bg-[#F8FAFC] dark:bg-white/5 rounded-2xl p-6 border border-black/5 dark:border-white/10 h-[320px] flex flex-col">
                    <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-widest text-[#4B5563] dark:text-white/50">
                      <FiBarChart2 size={14} className="text-[#00A8E8]" />
                      Performance
                    </div>
                    <div className="flex-1 min-h-0">
                      <Bar
                        data={chartData}
                        options={{
                          ...barOptions,
                          maintainAspectRatio: false,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== AI INSIGHTS ==================== */}
            {result.explanations && result.explanations.length > 0 && (
              <div className="bg-gradient-to-br from-[#00A8E8]/10 to-[#007EA7]/10 dark:from-[#00A8E8]/5 dark:to-[#007EA7]/5 rounded-[2rem] p-6 md:p-8 mb-8 border border-[#00A8E8]/20 dark:border-[#00A8E8]/10 relative overflow-hidden animate-fade-in-up delay-[450ms]">
                <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-10 text-[#00A8E8]">
                  <HiOutlineLightBulb className="text-8xl" />
                </div>
                <h3 className="text-xl font-display font-black text-[#1C1E21] dark:text-white mb-6 flex items-center gap-3 relative z-10">
                  <div className="p-2.5 bg-[#00A8E8] text-white rounded-xl shadow-md">
                    <HiOutlineSparkles size={20} />
                  </div>
                  AI Combinatorial Insights
                </h3>
                <div className="space-y-3 relative z-10">
                  {result.explanations.map((exp, idx) => (
                    <div
                      key={idx}
                      className="flex gap-4 items-start bg-white/60 dark:bg-white/5 p-5 rounded-2xl backdrop-blur-md border border-white/50 dark:border-white/10 shadow-soft hover:shadow-soft-xl transition-all"
                    >
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

            {/* ==================== FIT / GAP ANALYSIS ==================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-fade-in-up delay-[600ms]">
              <div className="bg-emerald-500/5 rounded-[2rem] p-6 border border-emerald-500/20 flex flex-col gap-4 shadow-soft group hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/20 rounded-xl group-hover:scale-110 transition-transform">
                    <HiOutlineCheckCircle className="text-2xl text-emerald-500 shrink-0" />
                  </div>
                  <h4 className="font-bold font-display text-emerald-600 dark:text-emerald-400 text-xl">
                    Why You Fit
                  </h4>
                </div>
                <p className="text-[#4B5563] dark:text-white/80 text-sm leading-relaxed p-5 bg-white/80 dark:bg-black/20 rounded-xl border border-black/5 dark:border-white/5 grow shadow-inner">
                  {result.fitReasoning ||
                    "Your strengths align with the core requirements of this field."}
                </p>
              </div>
              <div className="bg-amber-500/5 rounded-[2rem] p-6 border border-amber-500/20 flex flex-col gap-4 shadow-soft group hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-500/20 rounded-xl group-hover:scale-110 transition-transform">
                    <HiOutlineExclamationCircle className="text-2xl text-amber-500 shrink-0" />
                  </div>
                  <h4 className="font-bold font-display text-amber-600 dark:text-amber-500 text-xl">
                    Potential Gaps
                  </h4>
                </div>
                <p className="text-[#4B5563] dark:text-white/80 text-sm leading-relaxed p-5 bg-white/80 dark:bg-black/20 rounded-xl border border-black/5 dark:border-white/5 grow shadow-inner">
                  {result.gapReasoning ||
                    "Focus on the categories listed below to bridge the skill gap."}
                </p>
              </div>
            </div>

            {/* ==================== STRENGTHS & CAREERS ==================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-fade-in-up delay-[750ms]">
              <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[2rem] p-6 md:p-8 shadow-soft">
                <h3 className="flex items-center gap-2 font-display font-black text-[#1C1E21] dark:text-white mb-6 text-lg">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 rounded-lg">
                    <HiOutlineLightningBolt size={20} />
                  </div>
                  Foundational Strengths
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {(result.strengths || []).map((s, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-white/80 dark:bg-[#00171F]/80 rounded-xl border border-black/5 dark:border-white/10 shadow-sm text-[#1C1E21] dark:text-white/90 font-bold text-sm flex items-center gap-2"
                    >
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      {s}
                    </span>
                  ))}
                  {(!result.strengths || result.strengths.length === 0) && (
                    <p className="text-sm text-[#4B5563] dark:text-white/40 font-medium">
                      No specific strengths identified yet.
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[2rem] p-6 md:p-8 shadow-soft">
                <h3 className="flex items-center gap-2 font-display font-black text-[#1C1E21] dark:text-white mb-6 text-lg">
                  <div className="p-2 bg-amber-50 dark:bg-amber-500/10 text-amber-500 dark:text-amber-400 rounded-lg">
                    <HiOutlineAcademicCap size={20} />
                  </div>
                  Recommended Career Paths
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {(result.recommendedCareers || []).map((c, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-white/80 dark:bg-[#00171F]/80 rounded-xl border border-black/5 dark:border-white/10 shadow-sm text-[#1C1E21] dark:text-white/90 font-bold text-sm flex items-center gap-2"
                    >
                      <FiArrowRight
                        size={12}
                        className="text-amber-500 shrink-0"
                      />
                      {c}
                    </span>
                  ))}
                  {(!result.recommendedCareers ||
                    result.recommendedCareers.length === 0) && (
                    <p className="text-sm text-[#4B5563] dark:text-white/40 font-medium">
                      No career recommendations available.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ==================== WEAKNESSES & REMEDIATION ==================== */}
            {result.weaknesses && result.weaknesses.length > 0 && (
              <div className="mb-8 animate-fade-in-up delay-[900ms]">
                <h3 className="flex items-center gap-3 font-display font-black text-[#1C1E21] dark:text-white mb-6 text-xl px-2">
                  <div className="p-2.5 bg-rose-50 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400 rounded-xl">
                    <HiOutlineTrendingUp size={20} />
                  </div>
                  Targeted Remediation Areas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {result.weaknesses.map((w, idx) => (
                    <div
                      key={idx}
                      className="bg-white/60 dark:bg-white/5 p-6 rounded-[2rem] border border-black/5 dark:border-white/10 shadow-soft hover:shadow-soft-xl transition-all flex flex-col backdrop-blur-md"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-extrabold text-rose-600 dark:text-rose-400 uppercase text-xs tracking-wider bg-rose-50 dark:bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-100 dark:border-rose-500/20">
                          {w.category}
                        </span>
                      </div>
                      <p className="text-[#1C1E21] dark:text-white/90 text-[15px] mb-5 font-bold leading-relaxed">
                        {w.reason}
                      </p>
                      <div className="space-y-2.5 mt-auto">
                        {(w.improvementTips || []).map((tip, tIdx) => (
                          <div
                            key={tIdx}
                            className="flex gap-3 items-start text-xs font-medium text-[#4B5563] dark:text-white/70 bg-white/50 dark:bg-black/20 p-3.5 rounded-xl border border-black/5 dark:border-white/5 shadow-inner"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1 shrink-0" />
                            <span className="leading-relaxed">{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ==================== IMPROVEMENT SUGGESTIONS ==================== */}
            {result.improvementSuggestions &&
              result.improvementSuggestions.length > 0 && (
                <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[2rem] p-6 md:p-8 shadow-soft mb-8 animate-fade-in-up delay-[1050ms]">
                  <h3 className="flex items-center gap-3 font-display font-black text-[#1C1E21] dark:text-white mb-6 text-xl">
                    <div className="p-2.5 bg-violet-500/10 text-violet-500 dark:text-violet-400 rounded-xl border border-violet-500/20">
                      <FiBook size={20} />
                    </div>
                    Growth Roadmap
                  </h3>
                  <div className="space-y-3">
                    {result.improvementSuggestions.map((suggestion, idx) => (
                      <div
                        key={idx}
                        className="flex gap-4 items-start p-4 bg-white/80 dark:bg-black/20 rounded-xl border border-black/5 dark:border-white/5 shadow-inner hover:shadow-soft transition-all"
                      >
                        <div className="w-7 h-7 rounded-lg bg-violet-500/15 text-violet-500 dark:text-violet-400 flex items-center justify-center shrink-0 text-xs font-black border border-violet-500/20">
                          {idx + 1}
                        </div>
                        <p className="text-[#1C1E21] dark:text-white/80 text-sm font-medium leading-relaxed">
                          {suggestion}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Results;
