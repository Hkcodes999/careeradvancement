import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiTrendingUp,
  FiCpu,
  FiCheck,
  FiLayers,
  FiGlobe,
} from "react-icons/fi";
import Footer from "../../components/Footer";

const Home = () => {
  return (
    <div className="relative bg-[#FFFFFF] dark:bg-[#00171F] text-[#00171F] dark:text-white font-sans min-h-screen overflow-hidden selection:bg-[#00A8E8]/30">
      {/* Deep Tech Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#00A8E8]/20 rounded-full blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-screen"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#007EA7]/20 rounded-full blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-screen"></div>
      <div className="absolute top-[40%] left-[60%] w-[400px] h-[400px] bg-[#00A8E8]/10 rounded-full blur-[100px] pointer-events-none mix-blend-multiply dark:mix-blend-screen"></div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20 hidden md:block">
        <svg
          className="absolute w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="grid" w="40" h="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-black/[0.1] dark:text-[#00171F] dark:text-white/20"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          {/* Hero Content */}
          <div className="flex-1 text-center lg:text-left space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center px-4 py-1.5 bg-black/[0.03] dark:bg-[#00171F] dark:bg-white/5 backdrop-blur-md text-[#003459] dark:text-white/90 rounded-full text-xs font-bold border border-black/[0.08] dark:border-white/10 shadow-sm transition-all hover:bg-black/[0.05] dark:bg-[#00171F] dark:bg-white/10 cursor-default">
              <span className="w-2 h-2 bg-[#00A8E8] rounded-full mr-2 shadow-[0_0_10px_rgba(6,182,212,0.8)]"></span>
              v2.0 Now Live: AI Roadmap Generation
            </div>

            <h1 className="text-5xl lg:text-7xl font-display font-extrabold leading-[1.1] tracking-tight text-[#00171F] dark:text-white drop-shadow-sm">
              Your Future, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00A8E8] via-[#007EA7] to-[#00A8E8] animate-pulse-slow">
                Engineered by AI.
              </span>
            </h1>

            <p className="text-lg lg:text-xl text-[#003459] dark:text-white/70 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
              Stop guessing. Start building. We use advanced machine learning to
              match your unique aptitude profile with high-growth career
              trajectories.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center lg:justify-start pt-4">
              <Link to="/login" className="btn-primary py-4 px-8 text-lg group">
                Generate My Roadmap{" "}
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/" className="btn-secondary py-4 px-8 text-lg">
                View Sample Report
              </Link>
            </div>

            <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 lg:gap-8 text-sm font-bold text-[#003459] dark:text-white/70">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#00A8E8]/20 flex flex-col items-center justify-center border border-[#00A8E8]/30">
                  <FiCheck className="text-[#00A8E8] text-xs" />
                </div>{" "}
                No Credit Card
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#007EA7]/20 flex flex-col items-center justify-center border border-[#007EA7]/30">
                  <FiCheck className="text-[#007EA7] text-xs" />
                </div>{" "}
                95% Accuracy
              </div>
            </div>
          </div>

          {/* Hero Visual - Dashboard Mockup */}
          <div className="flex-1 w-full max-w-[600px] relative perspective-1000">
            <div className="relative glass-panel p-2 transform -rotate-2 hover:rotate-0 transition-all duration-700 ease-out group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00A8E8]/20 via-transparent to-[#007EA7]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl"></div>

              <div className="bg-[#00171F] dark:bg-white dark:bg-[#FFFFFF] dark:bg-[#00171F]-light rounded-xl overflow-hidden border border-black/[0.05] dark:border-white/5 relative z-10">
                {/* Mock Header */}
                <div className="h-10 border-b border-black/[0.05] dark:border-white/5 bg-[#FFFFFF] dark:bg-[#00171F] flex items-center px-4 gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  </div>
                  <div className="ml-4 h-4 w-32 bg-black/[0.03] dark:bg-[#00171F] dark:bg-white/5 rounded-full"></div>
                </div>
                {/* Mock Body */}
                <div className="p-6 space-y-6">
                  <div className="flex gap-4">
                    <div className="w-1/3 h-28 bg-[#FFFFFF] dark:bg-[#00171F] rounded-xl border border-black/[0.05] dark:border-white/5 p-4 transition-transform hover:-translate-y-1 duration-300">
                      <div className="w-8 h-8 rounded-lg bg-[#00A8E8]/20 mb-3 border border-[#00A8E8]/20"></div>
                      <div className="w-16 h-4 bg-black/[0.03] dark:bg-[#00171F] dark:bg-white/5 rounded mb-2"></div>
                      <div className="w-20 h-6 bg-black/[0.05] dark:bg-[#00171F] dark:bg-white/10 rounded"></div>
                    </div>
                    <div className="w-1/3 h-28 bg-[#FFFFFF] dark:bg-[#00171F] rounded-xl border border-black/[0.05] dark:border-white/5 p-4 transition-transform hover:-translate-y-1 duration-300">
                      <div className="w-8 h-8 rounded-lg bg-[#007EA7]/20 mb-3 border border-[#007EA7]/20"></div>
                      <div className="w-16 h-4 bg-black/[0.03] dark:bg-[#00171F] dark:bg-white/5 rounded mb-2"></div>
                      <div className="w-20 h-6 bg-black/[0.05] dark:bg-[#00171F] dark:bg-white/10 rounded"></div>
                    </div>
                    <div className="w-1/3 h-28 bg-[#FFFFFF] dark:bg-[#00171F] rounded-xl border border-black/[0.05] dark:border-white/5 p-4 transition-transform hover:-translate-y-1 duration-300">
                      <div className="w-8 h-8 rounded-lg bg-[#00A8E8]/20 mb-3 border border-[#00A8E8]/20"></div>
                      <div className="w-16 h-4 bg-black/[0.03] dark:bg-[#00171F] dark:bg-white/5 rounded mb-2"></div>
                      <div className="w-20 h-6 bg-black/[0.05] dark:bg-[#00171F] dark:bg-white/10 rounded"></div>
                    </div>
                  </div>
                  <div className="h-40 bg-[#FFFFFF] dark:bg-[#00171F] rounded-xl border border-black/[0.05] dark:border-white/5 p-4 flex items-end gap-2 px-6">
                    <div className="w-full bg-black/[0.03] dark:bg-[#00171F] dark:bg-white/5 rounded-t-lg h-[40%] transition-all hover:bg-black/[0.05] dark:bg-[#00171F] dark:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"></div>
                    <div className="w-full bg-[#00A8E8]-gradient rounded-t-lg h-[80%] transition-all hover:brightness-110 shadow-[0_0_20px_rgba(99,102,241,0.2)]"></div>
                    <div className="w-full bg-black/[0.03] dark:bg-[#00171F] dark:bg-white/5 rounded-t-lg h-[60%] transition-all hover:bg-black/[0.05] dark:bg-[#00171F] dark:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"></div>
                    <div className="w-full bg-black/[0.03] dark:bg-[#00171F] dark:bg-white/5 rounded-t-lg h-[30%] transition-all hover:bg-black/[0.05] dark:bg-[#00171F] dark:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"></div>
                    <div className="w-full bg-black/[0.03] dark:bg-[#00171F] dark:bg-white/5 rounded-t-lg h-[50%] transition-all hover:bg-black/[0.05] dark:bg-[#00171F] dark:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Badge */}
            <div className="absolute -bottom-6 -left-6 glass-panel p-4 z-20 transition-transform hover:-translate-y-2 duration-300 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#00A8E8]/10 text-[#00A8E8] rounded-full flex items-center justify-center border border-[#00A8E8]/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                  <FiTrendingUp size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#003459] dark:text-white/70 uppercase tracking-wider">
                    Career Match
                  </p>
                  <p className="text-xl font-extrabold text-[#00171F] dark:text-white">98.5%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF - INFINITE MARQUEE */}
      <section className="py-12 border-y border-black/[0.05] dark:border-white/5 bg-[#003459]/5 dark:bg-[#FFFFFF] dark:bg-[#00171F]-dark overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 text-center mb-10">
          <p className="text-xs font-bold text-[#003459] dark:text-white/70 uppercase tracking-widest">
            Trusted by extraordinary students worldwide
          </p>
        </div>

        <div className="relative flex overflow-x-hidden group">
          <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-[#F5F9FC] dark:from-[#FFFFFF] dark:from-[#00171F] via-transparent to-[#F5F9FC] dark:to-[#FFFFFF] dark:to-[#00171F] w-full"></div>
          <div className="animate-marquee whitespace-nowrap flex gap-16 px-8 items-center text-black/[0.05] dark:text-[#00171F] dark:text-white/10 font-display font-bold text-3xl">
            {[
              "Stanford",
              "MIT",
              "Cambridge",
              "IIT Bombay",
              "NUS",
              "Oxford",
              "Berkeley",
              "Harvard",
              "Yale",
              "Princeton",
              "Columbia",
              "Caltech",
            ].map((brand, i) => (
              <span
                key={i}
                className="hover:text-black/[0.2] dark:text-[#00171F] dark:text-white/40 transition-colors cursor-default select-none mx-4"
              >
                {brand}
              </span>
            ))}
          </div>
          <div className="absolute top-0 animate-marquee2 whitespace-nowrap flex gap-16 px-8 items-center text-black/[0.05] dark:text-[#00171F] dark:text-white/10 font-display font-bold text-3xl">
            {[
              "Stanford",
              "MIT",
              "Cambridge",
              "IIT Bombay",
              "NUS",
              "Oxford",
              "Berkeley",
              "Harvard",
              "Yale",
              "Princeton",
              "Columbia",
              "Caltech",
            ].map((brand, i) => (
              <span
                key={`clone-${i}`}
                className="hover:text-black/[0.2] dark:text-[#00171F] dark:text-white/40 transition-colors cursor-default select-none mx-4"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-display font-extrabold text-[#00171F] dark:text-white mb-6">
              Next-Gen Career Intelligence
            </h2>
            <p className="text-xl text-[#003459] dark:text-white/70 leading-relaxed font-medium">
              We don't just give you a job title. We architect a complete
              educational and professional pathway using cutting-edge models.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: FiCpu,
                title: "AI Aptitude Engine",
                desc: "Our proprietary algorithm analyzes your cognitive strengths against thousands of career profiles.",
                color: "text-[#00A8E8]",
                borderColor: "border-[#00A8E8]/20",
                shadowColor:
                  "group-hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]",
              },
              {
                icon: FiGlobe,
                title: "Real-Time Market Data",
                desc: "We pull live data on salary trends, job demand, and skill gaps to ensure your path is future-proof.",
                color: "text-[#007EA7]",
                borderColor: "border-[#007EA7]/20",
                shadowColor:
                  "group-hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]",
              },
              {
                icon: FiLayers,
                title: "Personalized Skill Stack",
                desc: "Get a custom curriculum of skills you need to acquire to reach your target role seamlessly.",
                color: "text-[#00A8E8]",
                borderColor: "border-[#00A8E8]/20",
                shadowColor:
                  "group-hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className={`group p-8 glass-panel border border-black/[0.05] dark:border-white/5 hover:${feature.borderColor} ${feature.shadowColor} transition-all duration-500 hover:-translate-y-2`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-8 transition-transform group-hover:scale-110 duration-300 bg-black/[0.03] dark:bg-[#00171F] dark:bg-white/5 border border-black/[0.08] dark:border-white/10 ${feature.color}`}
                >
                  <feature.icon />
                </div>
                <h3 className="text-2xl font-bold text-[#00171F] dark:text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-[#003459] dark:text-white/70 leading-relaxed font-medium">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ALTERNATING SECTION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#003459]/5 dark:bg-[#FFFFFF] dark:bg-[#00171F]-dark relative border-t border-black/[0.05] dark:border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <div className="flex-1 order-2 lg:order-1 relative">
            <div className="absolute inset-0 bg-[#00A8E8]-gradient rounded-3xl blur-[80px] opacity-20 transform rotate-6"></div>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-black/[0.08] dark:border-white/10 transform lg:-rotate-2 hover:rotate-0 transition-transform duration-500">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Students collaborating"
                className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700 opacity-80 mix-blend-luminosity hover:mix-blend-normal"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#FFFFFF] dark:from-[#00171F] via-transparent to-transparent"></div>
            </div>

            <div className="absolute -bottom-8 -right-8 glass-panel p-6 max-w-[280px] hidden md:block transition-transform hover:-translate-y-2 duration-300">
              <div className="flex gap-1 text-[#00A8E8] mb-3 text-sm">
                ★ ★ ★ ★ ★
              </div>
              <p className="text-[#003459] dark:text-white/90 font-medium text-sm mb-4 leading-relaxed">
                "CareerAdvancement clarified my confusion in 10 minutes. I went
                from 'undecided' to enrollment in Data Science."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#003459]/5 dark:bg-[#FFFFFF] dark:bg-[#00171F]-dark border border-black/[0.15] dark:border-white/20 flex items-center justify-center text-[#00A8E8] font-bold">
                  SJ
                </div>
                <div>
                  <p className="font-bold text-[#00171F] dark:text-white text-sm">Sarah Jenkins</p>
                  <p className="text-xs text-[#003459] dark:text-white/70 font-bold tracking-wide">
                    STUDENT, '25
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 order-1 lg:order-2">
            <div className="inline-flex items-center px-4 py-1.5 bg-[#00A8E8]/10 text-[#00A8E8] rounded-full text-xs font-bold border border-[#00A8E8]/20 mb-6">
              Why Choose Us
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-extrabold text-[#00171F] dark:text-white mb-6 leading-tight">
              Designed for the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00A8E8] to-[#00A8E8]">
                Modern Student
              </span>
            </h2>
            <p className="text-lg text-[#003459] dark:text-white/70 mb-8 leading-relaxed font-medium">
              Traditional counseling is slow and biased. We provide instant,
              unbiased, data-backed guidance that adapts as you grow.
            </p>
            <ul className="space-y-5">
              {[
                "Compare multiple career paths side-by-side",
                "View projected salary growth over 20 years",
                "Connect with university programs directly",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-4 text-[#003459] dark:text-white/90 font-bold text-lg"
                >
                  <div className="w-6 h-6 rounded-full bg-black/[0.05] dark:bg-[#00171F] dark:bg-white/10 text-[#00A8E8] flex items-center justify-center flex-shrink-0 mt-0.5 border border-black/[0.08] dark:border-white/10">
                    <FiCheck size={14} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <Link
                to="/signup"
                className="text-[#00171F] dark:text-white font-bold text-lg hover:text-[#00A8E8] flex items-center gap-2 group transition-colors"
              >
                Learn more about our methods{" "}
                <span className="w-8 h-8 rounded-full bg-black/[0.03] dark:bg-[#00171F] dark:bg-white/5 border border-black/[0.08] dark:border-white/10 flex items-center justify-center group-hover:bg-[#00A8E8]/20 group-hover:border-[#00A8E8]/40 group-hover:text-[#00A8E8] transition-all">
                  <FiArrowRight className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#00A8E8]-gradient opacity-[0.03] pointer-events-none"></div>
        <div className="max-w-5xl mx-auto glass-panel p-12 md:p-20 text-center relative overflow-hidden border border-[#00A8E8]/20 shadow-[0_0_50px_rgba(99,102,241,0.1)]">
          <div className="absolute top-[-50%] left-[-10%] w-[50%] h-[150%] bg-[#00A8E8]/20 blur-[100px] pointer-events-none transform -rotate-45"></div>
          <div className="absolute bottom-[-50%] right-[-10%] w-[50%] h-[150%] bg-[#007EA7]/20 blur-[100px] pointer-events-none transform -rotate-45"></div>

          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-display font-extrabold text-[#00171F] dark:text-white mb-6 tracking-tight drop-shadow-sm">
              Stop Guessing. <br /> Start Knowing.
            </h2>
            <p className="text-[#003459] dark:text-white/90 text-xl font-medium mb-12 max-w-2xl mx-auto">
              Join 50,000+ students who found their true calling with our AI
              assessment. It takes less than 15 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup" className="btn-primary">
                Start Free Assessment <FiArrowRight />
              </Link>
              <Link to="/" className="btn-secondary">
                View Demo
              </Link>
            </div>
            <p className="mt-8 text-[#003459] dark:text-white/70 font-bold text-sm tracking-wide uppercase">
              No credit card required · Free for students
            </p>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#003459]/5 dark:bg-[#FFFFFF] dark:bg-[#00171F]-dark border-t border-black/[0.05] dark:border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-extrabold text-[#00171F] dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-[#003459] dark:text-white/70 font-medium">
              Everything you need to know about CareerAdvancement.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "How accurate is the AI assessment?",
                a: "Our model is trained on over 10 million career data points and boasts a 95% accuracy rate in predicting job satisfaction based on ongoing alumni tracking.",
              },
              {
                q: "Is this free for students?",
                a: "Yes! The core assessment and basic roadmap are 100% free for verified students. We believe career guidance should be accessible to everyone.",
              },
              {
                q: "Can I use this for college applications?",
                a: "Absolutely. We provide a detailed report that you can include in your statement of purpose, common app, or share with your guidance counselor.",
              },
            ].map((item, i) => (
              <details
                key={i}
                className="group p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#00171F] border border-black/[0.05] dark:border-white/5 hover:border-black/[0.08] dark:border-white/10 transition-all cursor-pointer"
              >
                <summary className="text-xl font-bold text-[#00171F] dark:text-white flex justify-between items-center list-none outline-none">
                  {item.q}
                  <span className="w-8 h-8 rounded-full bg-black/[0.03] dark:bg-[#00171F] dark:bg-white/5 flex items-center justify-center text-[#003459] dark:text-white/70 group-open:rotate-45 group-hover:bg-black/[0.05] dark:bg-[#00171F] dark:bg-white/10 group-hover:text-[#00171F] dark:text-white transition-all">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7 1V13M1 7H13"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </summary>
                <p className="text-[#003459] dark:text-white/70 leading-relaxed pt-4 mt-4 border-t border-black/[0.05] dark:border-white/5 font-medium animate-fade-in-up">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      {/* Scroll to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-8 right-8 glass-panel text-[#00171F] dark:text-white p-4 rounded-full shadow-xl hover:bg-black/[0.05] dark:bg-[#00171F] dark:bg-white/10 transition-all duration-300 z-50 hover:-translate-y-2 group border border-black/[0.15] dark:border-white/20"
        aria-label="Scroll to top"
      >
        <FiArrowRight
          className="-rotate-90 group-hover:-translate-y-1 transition-transform"
          size={20}
        />
      </button>
    </div>
  );
};

export default Home;
