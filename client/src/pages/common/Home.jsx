import { Link } from "react-router-dom";
import {
  FiBriefcase,
  FiAward,
  FiBookOpen,
  FiCode,
  FiArrowRight,
  FiTrendingUp,
  FiUsers,
  FiCpu,
} from "react-icons/fi";

const Home = () => {
  return (
    <div className="relative overflow-x-hidden bg-white text-primary-dark font-sans">
      {/* Ambient Background Glow */}
      <div className="absolute -top-[150px] -right-[100px] w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(124,58,237,0.08)_0%,rgba(255,255,255,0)_70%)] z-0 pointer-events-none"></div>

      {/* HERO SECTION */}
      <section className="min-h-fit flex items-center px-[5%] py-20 relative z-10 bg-[linear-gradient(135deg,rgba(223,186,255,0.471)_0%,rgba(255,247,215,0.4)_100%)]">
        <div className="max-w-[100vw] mx-auto flex items-center gap-10 md:gap-20 w-full h-auto md:h-[85vh] max-[1100px]:flex-col max-[1100px]:text-center max-[1100px]:justify-center">
          {/* Hero Content */}
          <div className="flex-[1.2] bg-white p-6 md:p-[30px] rounded-[25px] max-[1100px]:flex max-[1100px]:flex-col max-[1100px]:items-center h-auto md:h-[80vh] w-full">
            <div className="inline-flex px-4 py-2 bg-[rgba(37,99,235,0.06)] text-accent-blue rounded-full text-sm font-bold mb-6 border border-[rgba(37,99,235,0.1)] tracking-wide">
              New: AI-Driven Insights 2.0
            </div>
            <h1 className="text-3xl md:text-5xl font-black leading-[1.1] mb-6 tracking-tight text-primary-dark">
              AI-Powered{" "}
              <span className="bg-gradient-to-br from-accent-blue via-accent-purple to-accent-amber bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-shift">
                Career Path Recommendation
              </span>{" "}
              Platform
            </h1>
            <p className="text-base text-text-muted leading-relaxed mb-10 max-w-[600px]">
              Make informed career decisions using intelligent assessments,
              data-driven insights, and personalized recommendations powered by
              AI.
            </p>

            <div className="flex gap-4 mb-12 max-[600px]:flex-col max-[600px]:w-full max-[1100px]:justify-center">
              <Link
                to="/login"
                className="px-6 py-3 md:px-8 md:py-4 rounded-xl font-bold no-underline flex items-center justify-center gap-2.5 transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] text-base bg-primary-dark text-white hover:-translate-y-[3px]"
              >
                Get Started <FiArrowRight />
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 md:px-8 md:py-4 rounded-xl font-bold no-underline flex items-center justify-center gap-2.5 transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] bg-white text-primary-dark border border-[rgba(226,232,240,0.8)] hover:bg-bg-light"
              >
                Explore Demo
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4 border-t border-[rgba(226,232,240,0.8)] pt-4 max-[1100px]:justify-center text-base">
              <div className="stat-item">
                <strong className="block text-2xl font-black text-primary-dark">
                  10k+
                </strong>
                <span className="text-sm text-text-muted uppercase tracking-wider">
                  Students
                </span>
              </div>
              <div className="w-[1px] bg-[rgba(226,232,240,0.8)]"></div>
              <div className="stat-item">
                <strong className="block text-2xl font-black text-primary-dark">
                  95%
                </strong>
                <span className="text-sm text-text-muted uppercase tracking-wider">
                  Accuracy
                </span>
              </div>
              <div className="w-[1px] bg-[rgba(226,232,240,0.8)]"></div>
              <div className="stat-item">
                <strong className="block text-2xl font-black text-primary-dark">
                  50+
                </strong>
                <span className="text-sm text-text-muted uppercase tracking-wider">
                  Career Paths
                </span>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="flex-[0.8] flex justify-center relative bg-[radial-gradient(circle,rgba(251,113,133,0.05)_0%,rgba(251,191,36,0.03)_50%,transparent_70%)] max-[1100px]:mt-10 max-[1100px]:scale-90 max-[600px]:hidden">
            <div className="relative w-[480px] h-[480px] flex items-center justify-center">
              {/* Nucleus */}
              <div className="w-[115px] h-[115px] bg-white rounded-[35%_65%_65%_35%/30%_30%_70%_70%] flex items-center justify-center shadow-[0_15px_35px_rgba(15,23,42,0.08),inset_0_0_15px_rgba(251,113,133,0.1)] border border-white z-10 animate-blob hover:animate-pulse-glow">
                <div className="bg-[radial-gradient(circle,rgba(124,58,237,0.2)_0%,transparent_70%)] opacity-80 animate-pulse"></div>
                <span className="text-[1.5rem] font-black tracking-tight bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">
                  CPRS
                </span>
              </div>

              {/* Orbit Paths */}
              <div className="absolute border-[1.5px] border-[rgba(123,0,255,0.8)] rounded-full w-[270px] h-[270px] animate-rotate-clockwise">
                <div className="absolute w-[54px] h-[54px] bg-white/85 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.05)] border border-white text-[#e11d48] text-[1.4rem] transition-all duration-300 -top-[27px] left-1/2 -translate-x-1/2 hover:scale-115 hover:text-amber-600 hover:bg-white hover:shadow-[0_15px_30px_rgba(251,113,133,0.2)]">
                  <FiBriefcase />
                </div>
                <div className="absolute w-[54px] h-[54px] bg-white/85 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.05)] border border-white text-[#e11d48] text-[1.4rem] transition-all duration-300 -bottom-[27px] left-1/2 -translate-x-1/2 hover:scale-115 hover:text-amber-600 hover:bg-white hover:shadow-[0_15px_30px_rgba(251,113,133,0.2)]">
                  <FiAward />
                </div>
              </div>

              <div className="absolute border-[1.5px] border-[rgba(123,0,255,0.8)] rounded-full border-dashed w-[450px] h-[450px] animate-rotate-counter-clockwise">
                <div className="absolute w-[54px] h-[54px] bg-white/85 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.05)] border border-white text-[#e11d48] text-[1.4rem] transition-all duration-300 top-1/2 -left-[27px] -translate-y-1/2 hover:scale-115 hover:text-amber-600 hover:bg-white hover:shadow-[0_15px_30px_rgba(251,113,133,0.2)]">
                  <FiBookOpen />
                </div>
                <div className="absolute w-[54px] h-[54px] bg-white/85 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.05)] border border-white text-[#e11d48] text-[1.4rem] transition-all duration-300 top-1/2 -right-[27px] -translate-y-1/2 hover:scale-115 hover:text-amber-600 hover:bg-white hover:shadow-[0_15px_30px_rgba(251,113,133,0.2)]">
                  <FiCode />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-[120px] px-[5%] bg-bg-light">
        <div className="text-center mb-20">
          <h2 className="text-[2.5rem] font-black mb-4 text-primary-dark">
            Why Choose CareerPath AI?
          </h2>
          <p className="text-text-muted text-[1.2rem] leading-relaxed">
            Engineered to align your passion with market reality.
          </p>
        </div>

        <div className="max-w-[1200px] mx-auto grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-8">
          {[
            {
              Icon: FiCpu,
              title: "Intelligent Assessments",
              text: "Adaptive, AI-generated questions that analyze your aptitude and interests beyond traditional tests.",
            },
            {
              Icon: FiTrendingUp,
              title: "Personalized Mapping",
              text: "Receive customized career pathways perfectly aligned with your unique strengths and goals.",
            },
            {
              Icon: FiUsers,
              title: "Insight-Driven Results",
              text: "Clear visual analytics that help you understand your potential and long-term career fit.",
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="p-12 bg-white rounded-3xl border border-[rgba(226,232,240,0.8)] transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-2.5 hover:border-accent-purple hover:shadow-[0_20px_40px_rgba(124,58,237,0.1)]"
            >
              <div className="w-16 h-16 bg-[rgba(124,58,237,0.05)] rounded-2xl flex items-center justify-center text-[2rem] text-accent-purple mb-7">
                <feature.Icon />
              </div>
              <h3 className="text-xl font-bold mb-3 text-primary-dark">
                {feature.title}
              </h3>
              <p className="text-text-muted leading-relaxed">{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-white pt-[100px] px-[5%] pb-10 border-t border-[rgba(226,232,240,0.8)] relative z-10">
        {/* Pre-Footer Call to Action */}
        <div className="bg-gradient-to-br from-[#0f172a] to-[#1e1b4b] rounded-3xl py-[60px] px-[40px] text-center text-white mx-[5%] mb-20 relative overflow-hidden border border-white/10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] max-[768px]:p-8 max-[640px]:rounded-3xl">
          <div className="absolute -top-[40%] -right-[5%] w-[450px] h-[450px] bg-[radial-gradient(circle,rgba(37,99,235,0.12)_0%,rgba(124,58,237,0.08)_50%,transparent_80%)] blur-[50px] pointer-events-none z-0"></div>
          <h2 className="relative z-10 text-[clamp(1.8rem,3.5vw,2.4rem)] font-extrabold mb-4 tracking-tight text-slate-50">
            Ready to define your future?
          </h2>
          <p className="relative z-10 text-slate-400 text-[1.1rem] mb-8 max-w-[520px] mx-auto leading-relaxed">
            Join 10,000+ students making data-backed career moves with CPRS AI.
          </p>
          <Link
            to="/login"
            className="relative z-10 bg-white text-slate-900 px-8 py-3.5 rounded-xl font-bold text-[0.95rem] inline-flex items-center gap-2 transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)]"
          >
            Start Free Assessment <FiArrowRight className="text-[1.1rem]" />
          </Link>
        </div>

        <div className="max-w-[1240px] mx-auto flex justify-between gap-20 pb-[60px] max-[1024px]:flex-col max-[1024px]:gap-[60px]">
          <div className="flex-[1.2] max-[1024px]:text-center max-[1024px]:flex max-[1024px]:flex-col max-[1024px]:items-center">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2">
                {/* Logo placeholder if needed, using text for now as per original */}
                <span className="font-black text-2xl tracking-tighter text-primary-dark">
                  CPRS <span className="text-accent-blue">AI</span>
                </span>
              </div>
            </div>
            <p className="text-text-muted leading-relaxed text-[0.95rem] max-w-[320px]">
              Precision career pathing powered by advanced machine learning and
              industry data.
            </p>
          </div>

          <div className="flex-[2] grid grid-cols-3 gap-10 max-[640px]:grid-cols-2 max-[640px]:gap-8">
            {[
              {
                header: "Platform",
                links: ["AI Assessments", "Career Mapping", "Skill Analysis"],
              },
              {
                header: "Resources",
                links: ["Documentation", "Market Trends", "Success Stories"],
              },
              {
                header: "Legal",
                links: ["Privacy Policy", "Terms of Service", "Data Security"],
              },
            ].map((col, idx) => (
              <div key={idx} className="flex flex-col gap-3.5">
                <h4 className="text-[0.85rem] font-extrabold uppercase text-primary-dark mb-4 tracking-widest">
                  {col.header}
                </h4>
                {col.links.map((link, lIdx) => (
                  <Link
                    key={lIdx}
                    to="/"
                    className="text-text-muted no-underline text-[0.95rem] font-medium transition-all duration-400 hover:text-accent-purple hover:translate-x-1.5 block"
                  >
                    {link}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-[1240px] mx-auto pt-10 border-t border-[rgba(226,232,240,0.8)] flex justify-between items-center text-text-muted text-[0.9rem] max-[640px]:flex-col max-[640px]:gap-6 max-[640px]:text-center">
          <p>© 2026 Career Path AI · Built with Science & Soul</p>
          <div className="flex items-center gap-2.5 bg-bg-light px-3.5 py-1.5 rounded-full font-semibold text-xs border border-[rgba(226,232,240,0.8)]">
            <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-status-pulse"></span>
            AI Systems Operational
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
