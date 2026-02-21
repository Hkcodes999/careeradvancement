import { Link } from "react-router-dom";
import { FiTwitter, FiLinkedin, FiInstagram, FiGithub } from "react-icons/fi";
import logo from "../assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-primary text-white/80 border-t border-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <Link to="/" className="inline-block group">
              <div className="relative flex items-center justify-center w-fit h-full group-hover:scale-105 transition-transform">
                <img src={logo} alt="Logo" className="w-15 h-12" />
              </div>
              <div className="flex">
                <span className="font-display font-bold text-2xl leading-none text-[#00171F] dark:text-white tracking-tight">
                  Career <span className="text-[#00171F]">Advancement</span>
                </span>
              </div>
            </Link>
            <p className="text-white/70 text-sm leading-relaxed max-w-sm">
              Empowering students with AI-driven career precision. We analyze
              market trends, personal aptitude, and academic data to build your
              perfect roadmap.
            </p>
            <div className="flex items-center gap-4 pt-2">
              {[
                { icon: FiTwitter, href: "#" },
                { icon: FiLinkedin, href: "#" },
                { icon: FiInstagram, href: "#" },
                { icon: FiGithub, href: "#" },
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white hover:text-primary transition-all duration-300"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="space-y-4">
            <h4 className="font-bold text-white tracking-wide text-sm uppercase">
              Platform
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                "AI Assessments",
                "Career Mapping",
                "Skill Analysis",
                "University Finder",
              ].map((item) => (
                <li key={item}>
                  <Link
                    to="#"
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-white tracking-wide text-sm uppercase">
              Resources
            </h4>
            <ul className="space-y-3 text-sm">
              {["Success Stories", "Blog", "Career Guide", "Help Center"].map(
                (item) => (
                  <li key={item}>
                    <Link
                      to="#"
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-white tracking-wide text-sm uppercase">
              Company
            </h4>
            <ul className="space-y-3 text-sm">
              {["About Us", "Careers", "Impact", "Contact"].map((item) => (
                <li key={item}>
                  <Link
                    to="#"
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-white/50">
          <p>© 2026 CareerAdvancement. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="#" className="hover:text-white/80 transition-colors">
              Privacy Policy
            </Link>
            <Link to="#" className="hover:text-white/80 transition-colors">
              Terms of Service
            </Link>
            <Link to="#" className="hover:text-white/80 transition-colors">
              Cookie Settings
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
