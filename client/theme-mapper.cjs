const fs = require("fs");

function processFile(path) {
  let file = fs.readFileSync(path, "utf8");

  // Order matters! Replace long string patterns first.
  const replacements = [
    {
      regex: /\bbg-surface\/80\b/g,
      replace: "bg-slate-50/90 dark:bg-surface/80",
    },
    {
      regex: /\bbg-surface-dark\b/g,
      replace: "bg-slate-100 dark:bg-surface-dark",
    },
    {
      regex: /\bbg-surface-light\b/g,
      replace: "bg-white dark:bg-surface-light",
    },
    { regex: /\bbg-surface\b/g, replace: "bg-slate-50 dark:bg-surface" },
    { regex: /\bbg-white\/5\b/g, replace: "bg-black/[0.03] dark:bg-white/5" },
    { regex: /\bbg-white\/10\b/g, replace: "bg-black/[0.05] dark:bg-white/10" },
    { regex: /\bbg-white\b/g, replace: "bg-slate-900 dark:bg-white" }, // Be careful, only exact words
    {
      regex: /\bborder-white\/5\b/g,
      replace: "border-black/[0.05] dark:border-white/5",
    },
    {
      regex: /\bborder-white\/10\b/g,
      replace: "border-black/[0.08] dark:border-white/10",
    },
    {
      regex: /\bborder-white\/20\b/g,
      replace: "border-black/[0.15] dark:border-white/20",
    },
    {
      regex: /\btext-white\/10\b/g,
      replace: "text-black/[0.05] dark:text-white/10",
    },
    {
      regex: /\btext-white\/20\b/g,
      replace: "text-black/[0.1] dark:text-white/20",
    },
    {
      regex: /\btext-white\/40\b/g,
      replace: "text-black/[0.2] dark:text-white/40",
    },
    { regex: /\btext-white\b/g, replace: "text-slate-900 dark:text-white" },
    {
      regex: /\btext-text-muted\b/g,
      replace: "text-slate-500 dark:text-text-muted",
    },
    {
      regex: /\btext-text-light\b/g,
      replace: "text-slate-600 dark:text-text-light",
    },
    {
      regex: /\bhover:bg-white\/10\b/g,
      replace: "hover:bg-black/[0.08] dark:hover:bg-white/10",
    },
    {
      regex: /\bhover:border-white\/10\b/g,
      replace: "hover:border-black/[0.1] dark:hover:border-white/10",
    },
    {
      regex: /\bhover:border-white\/20\b/g,
      replace: "hover:border-black/[0.15] dark:hover:border-white/20",
    },
    {
      regex: /\bfrom-surface-dark\b/g,
      replace: "from-slate-100 dark:from-surface-dark",
    },
    {
      regex: /\bto-surface-dark\b/g,
      replace: "to-slate-100 dark:to-surface-dark",
    },
    { regex: /\bvia-surface\b/g, replace: "via-slate-50 dark:via-surface" },
    { regex: /\bfrom-surface\b/g, replace: "from-slate-50 dark:from-surface" },
    { regex: /\bto-surface\b/g, replace: "to-slate-50 dark:to-surface" },
    {
      regex: /\bmix-blend-screen\b/g,
      replace: "mix-blend-multiply dark:mix-blend-screen",
    },
    {
      regex: /\bshadow-\[0_10px_40px_rgba\(0,0,0,0\.5\)\]\b/g,
      replace:
        "shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)]",
    },
    { regex: /\bbg-surface\/50\b/g, replace: "bg-white/50 dark:bg-surface/50" },
  ];

  replacements.forEach((r) => {
    file = file.replace(r.regex, r.replace);
  });

  // Fix any double replacements accidentally introduced
  file = file.replace(
    /text-slate-900 dark:text-slate-900 dark:text-white/g,
    "text-slate-900 dark:text-white",
  );

  fs.writeFileSync(path, file);
}

processFile("./src/pages/common/Home.jsx");
processFile("./src/components/Navbar.jsx");
