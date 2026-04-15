import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiCheck,
  FiCpu,
  FiTrendingUp,
  FiLayers,
  FiTarget,
  FiUsers,
  FiAward,
  FiBookOpen,
  FiChevronDown,
  FiPlay,
  FiZap,
  FiBarChart2,
  FiStar,
} from "react-icons/fi";
import Footer from "../../components/Footer";

const Home = () => {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="bg-white dark:bg-navy-900 text-text-main dark:text-white min-h-screen overflow-hidden">
      {/* ════════════════════════════════════════════════════
          HERO SECTION
      ════════════════════════════════════════════════════ */}
      <section className="relative pt-28 pb-8 lg:pt-26 lg:pb-12 overflow-hidden">
        {/* Rich Background Effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[20%] w-[700px] h-[700px] bg-primary/15 dark:bg-primary/10 rounded-full blur-[130px] animate-pulse-slow"></div>
          <div className="absolute top-[10%] right-[-5%] w-[500px] h-[500px] bg-secondary/10 dark:bg-secondary/5 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-primary/5 dark:bg-primary/5 rounded-full blur-[80px]"></div>
          {/* Grid dot pattern overlay */}
          <div className="absolute inset-0 opacity-[0.35] dark:opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(#00A8E8 0.8px, transparent 0.8px)', backgroundSize: '24px 24px' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Centered Hero Content */}
          <div className="text-center max-w-4xl mx-auto space-y-6 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary/10 dark:bg-primary/20 text-primary rounded-full text-xs font-bold tracking-wide uppercase border border-primary/20 dark:border-primary/30">
              <FiZap className="text-sm" />
              AI-Powered Career Intelligence Platform
            </div>

            <h1 className="text-5xl md:text-2xl lg:text-6xl font-extrabold tracking-tight">
              Your Career, Engineered
              <br />
              <span className="text-primary relative">
                With Precision
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 400 12" fill="none"><path d="M2 8 C 100 2, 300 2, 398 8" stroke="#00A8E8" strokeWidth="3" strokeLinecap="round" opacity="0.4" /></svg>
              </span>
            </h1>

            <p className="text-lg lg:text-xl text-text-muted dark:text-white/60 leading-relaxed max-w-2xl mx-auto">
              Take our 15-minute AI assessment and get a personalized career
              roadmap backed by real-time market data. No guesswork just
              data-driven clarity for your future.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                to="/login"
                className="bg-gradient-to-r from-primary to-secondary text-white font-bold py-4 px-10 rounded-xl transition-all duration-300 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-1 flex items-center justify-center gap-2 text-lg group"
              >
                Start Free Assessment
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/reports"
                className="bg-white dark:bg-white/10 hover:bg-light dark:hover:bg-white/15 text-text-main dark:text-white font-bold py-4 px-10 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-lg border border-black/[0.08] dark:border-white/10 hover:border-primary/30 shadow-sm"
              >
                <FiPlay className="text-primary" />
                Watch Demo
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-6 justify-center pt-2 text-text-light dark:text-white/40 text-sm font-medium">
              <div className="flex items-center gap-2">
                <FiCheck className="text-primary" />
                For students & professionals
              </div>
              <div className="flex items-center gap-2">
                <FiCheck className="text-primary" />
                Better career decisions
              </div>
              <div className="flex items-center gap-2">
                <FiCheck className="text-primary" />
                Results in 15 min
              </div>
            </div>
          </div>

          {/* Full-Width Dashboard Preview — Below Hero Text */}
          <div className="relative mt-16 max-w-5xl mx-auto">
            {/* Glow behind the mockup */}
            <div className="absolute -inset-4 bg-gradient-to-b from-primary/20 via-primary/5 to-transparent rounded-3xl blur-2xl pointer-events-none dark:from-primary/10"></div>

            <div className="relative bg-white dark:bg-navy-800 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 border border-black/[0.06] dark:border-white/10 overflow-hidden">
              {/* Browser Top Bar */}
              <div className="h-11 bg-surface dark:bg-navy-900 border-b border-black/[0.06] dark:border-white/10 flex items-center px-5 gap-3">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F57]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#FEBC2E]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#28C840]"></div>
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-white dark:bg-white/10 rounded-lg px-16 py-1.5 text-[11px] text-text-light dark:text-white/40 font-medium border border-black/[0.04] dark:border-white/5">
                    careeradvancement.in/dashboard
                  </div>
                </div>
              </div>

              {/* Mock Dashboard Body */}
              <div className="p-6 md:p-8 space-y-5 bg-surface/50 dark:bg-navy-900/50">
                {/* Top Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Career Match", value: "94%", color: "text-primary", icon: FiTarget },
                    { label: "Skills Score", value: "87/100", color: "text-emerald-500", icon: FiAward },
                    { label: "Paths Found", value: "12", color: "text-amber-500", icon: FiLayers },
                    { label: "Market Fit", value: "High", color: "text-primary", icon: FiTrendingUp },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-navy-800 rounded-xl p-4 border border-black/[0.04] dark:border-white/5 flex items-center gap-3"
                    >
                      <div className={`w-10 h-10 rounded-xl bg-surface dark:bg-navy-900 flex items-center justify-center ${stat.color} flex-shrink-0`}>
                        <stat.icon size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] text-text-light dark:text-white/50 font-bold uppercase tracking-wider">
                          {stat.label}
                        </p>
                        <p className={`text-xl font-extrabold ${stat.color}`}>
                          {stat.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chart + Sidebar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Chart Area */}
                  <div className="md:col-span-2 bg-white dark:bg-navy-800 rounded-xl p-5 border border-black/[0.04] dark:border-white/5">
                    <div className="flex justify-between items-center mb-5">
                      <p className="text-sm font-bold text-text-main dark:text-white">
                        Skill Growth Trajectory
                      </p>
                      <span className="text-[10px] bg-primary/10 dark:bg-primary/20 text-primary px-3 py-1 rounded-full font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                        Live
                      </span>
                    </div>
                    <div className="flex items-end gap-2 h-32 md:h-36">
                      {[35, 48, 42, 58, 52, 68, 63, 78, 74, 88, 82, 95].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t-lg transition-all duration-500"
                          style={{
                            height: `${h}%`,
                            background:
                              i >= 10
                                ? "linear-gradient(180deg, #00A8E8, #007EA7)"
                                : undefined,
                            backgroundColor: i < 10 ? (i % 2 === 0 ? "#E5E7EB" : "#D1D5DB") : undefined,
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>

                  {/* Sidebar Info */}
                  <div className="bg-white dark:bg-navy-800 rounded-xl p-5 border border-black/[0.04] dark:border-white/5 space-y-4">
                    <p className="text-sm font-bold text-text-main dark:text-white">Top Matches</p>
                    {[
                      { role: "Data Scientist", pct: "94%", salary: "₹12L" },
                      { role: "ML Engineer", pct: "89%", salary: "₹13L" },
                      { role: "Product Analyst", pct: "82%", salary: "₹9L" },
                    ].map((match, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-black/[0.04] dark:border-white/5 last:border-0">
                        <div>
                          <p className="text-sm font-bold text-text-main dark:text-white">{match.role}</p>
                          <p className="text-[11px] text-text-light dark:text-white/40">{match.salary} avg</p>
                        </div>
                        <span className="text-sm font-extrabold text-primary">{match.pct}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Badges */}
            <div className="absolute -bottom-6 -left-4 lg:-left-8 bg-white dark:bg-navy-800 rounded-2xl p-4 shadow-xl shadow-black/10 dark:shadow-black/30 border border-black/[0.06] dark:border-white/10 animate-float hidden md:flex items-center gap-3 z-20">
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <FiTrendingUp size={20} />
              </div>
              <div>
                <p className="text-[10px] text-text-light dark:text-white/50 font-bold uppercase tracking-wider">
                  Career Match
                </p>
                <p className="text-2xl font-extrabold text-text-main dark:text-white">
                  98.5%
                </p>
              </div>
            </div>

            <div className="absolute -top-4 -right-4 lg:-right-8 bg-white dark:bg-navy-800 rounded-2xl p-4 shadow-xl shadow-black/10 dark:shadow-black/30 border border-black/[0.06] dark:border-white/10 animate-float-delayed hidden md:flex items-center gap-3 z-20">
              <div className="w-11 h-11 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <FiAward size={20} />
              </div>
              <div>
                <p className="text-[10px] text-text-light dark:text-white/50 font-bold uppercase tracking-wider">
                  Avg. Salary
                </p>
                <p className="text-2xl font-extrabold text-text-main dark:text-white">
                  ₹12L
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          STATS BAR
      ════════════════════════════════════════════════════ */}
      <section className="border-y border-black/[0.06] dark:border-white/5 bg-surface dark:bg-navy-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "50,000+", label: "Students Guided", icon: FiUsers },
              { value: "95%", label: "Accuracy Rate", icon: FiTarget },
              { value: "200+", label: "Career Paths", icon: FiLayers },
              { value: "4.9★", label: "User Rating", icon: FiStar },
            ].map((stat, i) => (
              <div key={i} className="text-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary mx-auto mb-3">
                  <stat.icon size={22} />
                </div>
                <p className="text-3xl md:text-4xl font-extrabold text-text-main dark:text-white">
                  {stat.value}
                </p>
                <p className="text-sm text-text-muted dark:text-white/50 font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          FEATURES SECTION
      ════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 text-primary rounded-full text-xs font-bold tracking-wide uppercase">
              Core Platform
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold">
              Everything You Need to{" "}
              <span className="text-primary">Decide With Confidence</span>
            </h2>
            <p className="text-lg text-text-muted dark:text-white/60 leading-relaxed">
              Our AI engine analyzes cognitive strengths, market trends, and
              academic data to build a roadmap that's uniquely yours.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: FiCpu,
                title: "AI Aptitude Engine",
                desc: "Our proprietary algorithm maps 50+ cognitive data points against thousands of career profiles to find your strongest matches.",
                gradient: "from-primary to-secondary",
              },
              {
                icon: FiBarChart2,
                title: "Live Market Data",
                desc: "Real-time salary trends, job demand forecasts, and industry growth metrics ensure your career path is future-proof.",
                gradient: "from-secondary to-navy-700",
              },
              {
                icon: FiLayers,
                title: "Personalized Roadmap",
                desc: "Get a custom skill-building curriculum with courses, certifications, and milestones tailored to your target role.",
                gradient: "from-primary to-primary-hover",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group bg-white dark:bg-navy-800 rounded-2xl p-8 lg:p-10 border border-black/[0.05] dark:border-white/5 hover:border-primary/30 dark:hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white text-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/20`}
                >
                  <feature.icon />
                </div>
                <h3 className="text-xl font-bold mb-3 text-text-main dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-text-muted dark:text-white/60 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 bg-surface dark:bg-navy-800/50 border-y border-black/[0.06] dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 text-primary rounded-full text-xs font-bold tracking-wide uppercase">
              How It Works
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold">
              Three Steps to{" "}
              <span className="text-primary">Career Clarity</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: FiBookOpen,
                title: "Take the Assessment",
                desc: "Complete our 15-minute AI-powered aptitude test. It evaluates cognitive patterns, interests, and analytical strengths.",
              },
              {
                step: "02",
                icon: FiTarget,
                title: "Get Your Matches",
                desc: "Our engine cross-references your profile with 200+ career paths using live salary data and market demand signals.",
              },
              {
                step: "03",
                icon: FiAward,
                title: "Follow Your Roadmap",
                desc: "Receive a tailored action plan with courses, certifications, and milestones to reach your ideal career.",
              },
            ].map((item, i) => (
              <div key={i} className="relative text-center group">
                {/* Step Number */}
                <div className="text-8xl font-extrabold text-primary/10 dark:text-primary/5 absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 select-none pointer-events-none">
                  {item.step}
                </div>

                <div className="relative z-10 pt-12 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-white dark:bg-navy-900 border border-black/[0.06] dark:border-white/10 flex items-center justify-center text-primary text-2xl mx-auto shadow-soft-xl group-hover:border-primary/30 transition-colors">
                    <item.icon />
                  </div>
                  <h3 className="text-xl font-bold text-text-main dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-text-muted dark:text-white/60 leading-relaxed max-w-sm mx-auto">
                    {item.desc}
                  </p>
                </div>

                {/* Connector Line */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-24 left-[calc(50%+60px)] w-[calc(100%-120px)] h-px bg-gradient-to-r from-primary/20 to-primary/5"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          SOCIAL PROOF / TESTIMONIALS
      ════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
            {/* Left — Image */}
            <div className="flex-1 relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/10 dark:shadow-black/30">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Students collaborating on career planning"
                  className="w-full h-[420px] object-cover"
                  loading="lazy"
                />
              </div>

              {/* Floating Testimonial Card */}
              <div className="absolute -bottom-8 -right-4 lg:-right-8 bg-white dark:bg-navy-800 rounded-2xl p-5 shadow-xl shadow-black/10 dark:shadow-black/30 border border-black/[0.06] dark:border-white/10 max-w-[300px] hidden md:block">
                <div className="flex gap-0.5 text-amber-400 mb-3 text-sm">
                  {"★★★★★"}
                </div>
                <p className="text-sm text-text-main dark:text-white/90 font-medium leading-relaxed mb-4">
                  "CareerAdvancement turned my confusion into a clear plan. I
                  went from undecided to enrolled in Data Science in 2 weeks."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    SK
                  </div>
                  <div>
                    <p className="font-bold text-sm text-text-main dark:text-white">
                      Sarah K.
                    </p>
                    <p className="text-xs text-primary font-bold uppercase tracking-wider">
                      Student '25
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — Content */}
            <div className="flex-1 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 text-primary rounded-full text-xs font-bold tracking-wide uppercase">
                Why Students Choose Us
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
                Built for the{" "}
                <span className="text-primary">Modern Student</span>
              </h2>
              <p className="text-lg text-text-muted dark:text-white/60 leading-relaxed">
                Traditional career counseling is slow, expensive, and biased. We
                deliver instant, unbiased, data-backed guidance that evolves
                with the market.
              </p>

              <ul className="space-y-5">
                {[
                  "Compare multiple career paths side-by-side",
                  "View projected salary growth over 20 years",
                  "Connect directly with university programs",
                  "Track your skill development in real time",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-4 text-text-main dark:text-white font-medium text-lg"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
                      <FiCheck size={16} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          CTA SECTION
      ════════════════════════════════════════════════════ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 to-navy-800 dark:from-navy-800 dark:to-navy-900 p-12 md:p-20 text-center text-white">
          {/* Ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
              Stop Guessing.
              <br />
              Start <span className="text-primary">Knowing.</span>
            </h2>
            <p className="text-white/70 text-xl font-medium max-w-2xl mx-auto">
              Join 50,000+ students who found their calling with our AI
              assessment. It takes less than 15 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                to="/signup"
                className="bg-primary hover:bg-primary-hover text-white font-bold py-4 px-10 rounded-xl transition-all duration-300 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 flex items-center justify-center gap-2 text-lg"
              >
                Start Free Assessment <FiArrowRight />
              </Link>
              <Link
                to="/"
                className="bg-white/10 hover:bg-white/15 text-white font-bold py-4 px-10 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-lg border border-white/10 hover:border-white/20"
              >
                View Sample Report
              </Link>
            </div>
            <p className="text-white/40 font-bold text-sm tracking-wide uppercase pt-2">
              No credit card required · Free for students
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          FAQ SECTION
      ════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 bg-surface dark:bg-navy-800/50 border-t border-black/[0.06] dark:border-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-extrabold">
              Frequently Asked <span className="text-primary">Questions</span>
            </h2>
            <p className="text-lg text-text-muted dark:text-white/60">
              Everything you need to know about CareerAdvancement.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "How accurate is the AI assessment?",
                a: "Our model is trained on over 10 million career data points and achieves a 95% accuracy rate in predicting job satisfaction, validated through ongoing alumni tracking across 200+ institutions.",
              },
              {
                q: "Is this free for students?",
                a: "Yes! The core assessment and basic career roadmap are 100% free for verified students. We believe career guidance should be accessible to everyone regardless of background.",
              },
              {
                q: "How long does the assessment take?",
                a: "The full assessment takes about 15 minutes. It evaluates cognitive patterns, analytical strengths, creative abilities, and interpersonal skills through adaptive questioning.",
              },
              {
                q: "Can I use results for college applications?",
                a: "Absolutely. We provide a detailed PDF report that you can include in your statement of purpose, attach to your common app, or share directly with your guidance counselor.",
              },
              {
                q: "How is this different from a career quiz?",
                a: "Career quizzes use simple preference matching. Our AI engine analyzes cognitive aptitude data against real-time market conditions, salary projections, and skill-gap analysis to provide actionable, data-backed career recommendations.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white dark:bg-navy-900 rounded-2xl border border-black/[0.05] dark:border-white/5 overflow-hidden transition-all duration-300 hover:border-primary/20"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex justify-between items-center p-6 text-left"
                >
                  <span className="text-lg font-bold text-text-main dark:text-white pr-4">
                    {item.q}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full bg-surface dark:bg-white/5 flex items-center justify-center text-text-muted dark:text-white/50 flex-shrink-0 transition-transform duration-300 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  >
                    <FiChevronDown size={18} />
                  </div>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaq === i ? "max-h-60" : "max-h-0"
                  }`}
                >
                  <p className="px-6 pb-6 text-text-muted dark:text-white/60 leading-relaxed">
                    {item.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
