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
  FiCheck,
  FiLayers,
  FiGlobe,
} from "react-icons/fi";
import Footer from "../../components/Footer";

const Home = () => {
  return (
    <div className="relative bg-surface text-text-main font-sans min-h-screen">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-gradient-to-b from-light to-transparent opacity-60"></div>
      </div>

      {/* HERO SECTION - LIGHT MODE */}
      <section className="relative z-10 pt-32 pb-24 lg:pt-40 lg:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-light via-surface to-white">
        {/* Background Accents */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-secondary/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24 relative z-10">
          {/* Hero Content */}
          <div className="flex-1 text-center lg:text-left space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center px-3 py-1 bg-white text-primary rounded-full text-xs font-bold border border-secondary/30 shadow-sm">
              <span className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse"></span>
              v2.0 Now Live: AI Roadmap Generation
            </div>

            <h1 className="text-5xl lg:text-7xl font-display font-bold leading-[1.1] tracking-tight text-text-main">
              Your Future, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light">
                Engineered by AI.
              </span>
            </h1>

            <p className="text-xl text-text-muted leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light">
              Stop guessing. Start building. We use advanced machine learning to
              match your unique aptitude profile with high-growth career
              trajectories.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center lg:justify-start">
              <Link
                to="/login"
                className="btn-primary py-4 px-8 text-lg hover:-translate-y-1 shadow-xl shadow-primary/20"
              >
                Generate My Roadmap <FiArrowRight />
              </Link>
              <Link
                to="/"
                className="px-8 py-4 rounded-xl font-bold text-primary bg-white hover:bg-light border border-secondary/30 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                View Sample Report
              </Link>
            </div>

            <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 text-sm font-medium text-text-light">
              <div className="flex items-center gap-2">
                <FiCheck className="text-primary text-lg" /> No Credit Card
                Required
              </div>
              <div className="flex items-center gap-2">
                <FiCheck className="text-primary text-lg" /> 95% Accuracy Rate
              </div>
            </div>
          </div>

          {/* Hero Visual - Dashboard Mockup */}
          <div className="flex-1 w-full max-w-[600px] relative perspective-1000">
            {/* Decorative Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>

            <div className="relative bg-white border border-secondary/20 rounded-2xl shadow-soft-2xl p-2 transform rotate-y-[-5deg] rotate-x-[5deg] hover:rotate-0 transition-transform duration-500">
              <div className="bg-surface rounded-xl overflow-hidden border border-secondary/10">
                {/* Mock Header */}
                <div className="h-10 border-b border-secondary/10 bg-white flex items-center px-4 gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  </div>
                  <div className="ml-4 h-4 w-32 bg-secondary/10 rounded-full"></div>
                </div>
                {/* Mock Body */}
                <div className="p-6 space-y-6">
                  <div className="flex gap-4">
                    <div className="w-1/3 h-32 bg-white rounded-xl shadow-sm border border-secondary/10 p-4">
                      <div className="w-8 h-8 rounded-lg bg-secondary/20 mb-3"></div>
                      <div className="w-16 h-4 bg-secondary/10 rounded mb-2"></div>
                      <div className="w-24 h-6 bg-secondary/5 rounded"></div>
                    </div>
                    <div className="w-1/3 h-32 bg-white rounded-xl shadow-sm border border-secondary/10 p-4">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 mb-3"></div>
                      <div className="w-16 h-4 bg-secondary/10 rounded mb-2"></div>
                      <div className="w-24 h-6 bg-secondary/5 rounded"></div>
                    </div>
                    <div className="w-1/3 h-32 bg-white rounded-xl shadow-sm border border-secondary/10 p-4">
                      <div className="w-8 h-8 rounded-lg bg-accent/30 mb-3"></div>
                      <div className="w-16 h-4 bg-secondary/10 rounded mb-2"></div>
                      <div className="w-24 h-6 bg-secondary/5 rounded"></div>
                    </div>
                  </div>
                  <div className="h-40 bg-white rounded-xl shadow-sm border border-secondary/10 p-4 flex items-end gap-2">
                    <div className="w-full bg-secondary/20 rounded-t-lg h-[40%]"></div>
                    <div className="w-full bg-primary rounded-t-lg h-[80%]"></div>
                    <div className="w-full bg-secondary/20 rounded-t-lg h-[60%]"></div>
                    <div className="w-full bg-secondary/20 rounded-t-lg h-[30%]"></div>
                    <div className="w-full bg-secondary/20 rounded-t-lg h-[50%]"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Badge */}
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-soft-xl border border-secondary/20 animate-float">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                  <FiTrendingUp size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-text-muted uppercase">
                    Career Match
                  </p>
                  <p className="text-lg font-bold text-text-main">98.5%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF - INFINITE MARQUEE */}
      <section className="py-10 border-y border-secondary/10 bg-light/30 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center mb-8">
          <p className="text-sm font-bold text-text-light uppercase tracking-widest">
            Trusted by students from top institutions
          </p>
        </div>

        <div className="relative flex overflow-x-hidden group">
          <div className="animate-marquee whitespace-nowrap flex gap-16 px-8 items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
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
                className="text-3xl font-display font-bold text-text-muted hover:text-primary transition-colors cursor-default select-none mx-4"
              >
                {brand}
              </span>
            ))}
          </div>
          <div className="absolute top-0 animate-marquee2 whitespace-nowrap flex gap-16 px-8 items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
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
                className="text-3xl font-display font-bold text-text-muted hover:text-primary transition-colors cursor-default select-none mx-4"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl font-display font-bold text-text-main mb-6">
              Science-Based Career Architecture
            </h2>
            <p className="text-xl text-text-muted leading-relaxed font-light">
              We don't just give you a job title. We architect a complete
              educational and professional pathway based on 50+ data points.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: FiCpu,
                title: "AI Aptitude Engine",
                desc: "Our proprietary algorithm analyzes your cognitive strengths against thousands of career profiles.",
                color: "text-primary",
                bg: "bg-primary/10",
              },
              {
                icon: FiGlobe,
                title: "Real-Time Market Data",
                desc: "We pull live data on salary trends, job demand, and skill gaps to ensure your path is future-proof.",
                color: "text-primary-hover",
                bg: "bg-secondary/20",
              },
              {
                icon: FiLayers,
                title: "Personalized Skill Stack",
                desc: "Get a custom curriculum of skills you need to acquire to reach your target role.",
                color: "text-text-main",
                bg: "bg-light",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-8 rounded-2xl bg-white border border-secondary/10 shadow-lg shadow-gray-100/50 hover:shadow-soft-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div
                  className={`w-14 h-14 ${feature.bg} ${feature.color} rounded-xl flex items-center justify-center text-2xl mb-6`}
                >
                  <feature.icon />
                </div>
                <h3 className="text-xl font-bold text-text-main mb-3">
                  {feature.title}
                </h3>
                <p className="text-text-muted leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ALTERNATING SECTION */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-light/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-1 order-2 lg:order-1 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-light to-primary/20 rounded-3xl blur-3xl opacity-50 transform -rotate-3"></div>
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Students collaborating"
              className="relative rounded-2xl shadow-soft-2xl border-4 border-white transform rotate-2 hover:rotate-0 transition-all duration-500"
            />

            <div className="absolute -bottom-10 -right-10 bg-white p-6 rounded-xl shadow-soft-xl max-w-xs border border-secondary/20 hidden md:block">
              <p className="text-text-muted text-sm mb-4">
                "CareerAdvancement clarified my confusion in 10 minutes. I went
                from 'undecided' to enrollment in Data Science."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary/30 rounded-full"></div>
                <div>
                  <p className="font-bold text-text-main text-sm">
                    Sarah Jenkins
                  </p>
                  <p className="text-xs text-text-light">
                    Student, Class of '25
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 order-1 lg:order-2">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-text-main mb-6">
              Designed for the Modern Student
            </h2>
            <p className="text-lg text-text-muted mb-8 leading-relaxed">
              Traditional counseling is slow and biased. We provide instant,
              unbiased, data-backed guidance that adapts as you grow.
            </p>
            <ul className="space-y-4">
              {[
                "Compare multiple career paths side-by-side",
                "View projected salary growth over 20 years",
                "Connect with university programs directly",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-text-main font-medium"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <FiCheck size={14} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <Link
                to="/signup"
                className="text-primary font-bold hover:text-primary-hover flex items-center gap-2 group"
              >
                Learn more about our methods{" "}
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-15 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-primary rounded-[3rem] p-10 md:p-5 text-center relative overflow-hidden shadow-2xl shadow-primary/20">
          <div className="absolute top-0 left-0 w-60 h-60 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/20 rounded-full blur-[100px]"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/20 rounded-full blur-[100px]"></div>

          <div className="relative z-10">
            <h2 className="text-3xl md:text-3xl font-display font-bold text-white mb-8 tracking-tight">
              Stop Guessing. <br /> Start Knowing.
            </h2>
            <p className="text-white/80 text-sm mb-12 max-w-2xl mx-auto font-light">
              Join 50,000+ students who found their true calling with our AI
              assessment. It takes less than 15 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="px-5 py-5 bg-white text-primary rounded-xl font-bold text-lg hover:bg-light transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                Start Free Assessment
              </Link>
              <Link
                to="/"
                className="px-10 py-5 bg-transparent border border-white/30 text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all"
              >
                View Demo
              </Link>
            </div>
            <p className="mt-8 text-white/60 text-sm">
              No credit card required · Free for students
            </p>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-secondary/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center text-text-main mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "How accurate is the AI assessment?",
                a: "Our model is trained on over 10 million career data points and boasts a 95% accuracy rate in predicting job satisfaction.",
              },
              {
                q: "Is this free for students?",
                a: "Yes! The core assessment and basic roadmap are 100% free for verified students.",
              },
              {
                q: "Can I use this for college applications?",
                a: "Absolutely. We provide a detailed report that you can include in your statement of purpose or counselor discussions.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-light/30 border border-light hover:bg-white hover:shadow-soft-xl transition-all cursor-pointer group"
              >
                <h3 className="text-lg font-bold text-text-main mb-2 flex justify-between items-center">
                  {item.q}
                  <FiArrowRight className="text-text-light group-hover:text-primary transition-transform group-hover:rotate-90" />
                </h3>
                <p className="text-text-muted leading-relaxed border-t border-secondary/10 pt-2 mt-2 hidden group-hover:block transition-all animate-fade-in-up">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      {/* Scroll to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-8 right-8 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary-hover transition-all duration-300 z-50 hover:-translate-y-1 group"
        aria-label="Scroll to top"
      >
        <FiArrowRight className="-rotate-90 group-hover:-translate-y-1 transition-transform" />
      </button>
    </div>
  );
};

export default Home;
