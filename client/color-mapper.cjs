const fs = require("fs");

const PALETTE = {
  white: "#FFFFFF",
  veryDarkNavy: "#00171F",
  navy: "#003459",
  oceanBlue: "#007EA7",
  skyBlue: "#00A8E8",
};

function processFile(path) {
  let file = fs.readFileSync(path, "utf8");

  // Light Mode Backgrounds
  file = file.replace(/\bbg-slate-50\b/g, `bg-[${PALETTE.white}]`);
  file = file.replace(/\bbg-slate-100\b/g, `bg-[${PALETTE.navy}]/5`);
  file = file.replace(/\bbg-slate-200\b/g, `bg-[${PALETTE.navy}]/10`);
  file = file.replace(
    /\bhover:bg-slate-200\b/g,
    `hover:bg-[${PALETTE.navy}]/10`,
  );
  file = file.replace(
    /\bhover:bg-slate-300\b/g,
    `hover:bg-[${PALETTE.navy}]/20`,
  );
  file = file.replace(/\bbg-slate-900\b/g, `bg-[${PALETTE.veryDarkNavy}]`);
  file = file.replace(
    /\bhover:bg-slate-900\b/g,
    `hover:bg-[${PALETTE.veryDarkNavy}]`,
  );

  // Light Mode Text
  file = file.replace(/\btext-slate-900\b/g, `text-[${PALETTE.veryDarkNavy}]`);
  file = file.replace(
    /\bhover:text-slate-900\b/g,
    `hover:text-[${PALETTE.veryDarkNavy}]`,
  );
  file = file.replace(/\btext-slate-600\b/g, `text-[${PALETTE.navy}]`);
  file = file.replace(/\btext-slate-500\b/g, `text-[${PALETTE.navy}]`);
  file = file.replace(/\btext-slate-400\b/g, `text-[${PALETTE.navy}]/70`);

  // Light Mode Borders
  file = file.replace(/\bborder-slate-200\b/g, `border-[${PALETTE.navy}]/10`);
  file = file.replace(
    /\bhover:border-slate-300\b/g,
    `hover:border-[${PALETTE.navy}]/20`,
  );
  file = file.replace(
    /\bborder-black\/\[0\.05\]\b/g,
    `border-[${PALETTE.navy}]/10`,
  );
  file = file.replace(
    /\bborder-black\/\[0\.08\]\b/g,
    `border-[${PALETTE.navy}]/15`,
  );
  file = file.replace(
    /\bborder-black\/\[0\.1\]\b/g,
    `border-[${PALETTE.navy}]/20`,
  );
  file = file.replace(
    /\bborder-black\/\[0\.15\]\b/g,
    `border-[${PALETTE.navy}]/20`,
  );

  // Miscellaneous Light Mode
  file = file.replace(/\bbg-black\/\[0\.03\]\b/g, `bg-[${PALETTE.navy}]/5`);
  file = file.replace(/\bbg-black\/\[0\.05\]\b/g, `bg-[${PALETTE.navy}]/5`);
  file = file.replace(/\bbg-black\/\[0\.08\]\b/g, `bg-[${PALETTE.navy}]/10`);
  file = file.replace(/\bbg-black\/\[0\.1\]\b/g, `bg-[${PALETTE.navy}]/10`);
  file = file.replace(
    /\bhover:bg-black\/\[0\.08\]\b/g,
    `hover:bg-[${PALETTE.navy}]/10`,
  );
  file = file.replace(
    /\bhover:bg-black\/\[0\.1\]\b/g,
    `hover:bg-[${PALETTE.navy}]/15`,
  );
  file = file.replace(
    /\btext-black\/\[0\.05\]\b/g,
    `text-[${PALETTE.navy}]/30`,
  );
  file = file.replace(/\btext-black\/\[0\.1\]\b/g, `text-[${PALETTE.navy}]/40`);
  file = file.replace(/\btext-black\/\[0\.2\]\b/g, `text-[${PALETTE.navy}]/60`);

  // Gradients - Light Mode
  file = file.replace(/\bfrom-slate-50\b/g, `from-[${PALETTE.white}]`);
  file = file.replace(/\bto-slate-50\b/g, `to-[${PALETTE.white}]`);
  file = file.replace(/\bvia-slate-50\b/g, `via-[${PALETTE.white}]`);
  file = file.replace(/\bfrom-slate-100\b/g, `from-[#F5F9FC]`); // A soft white/navy mix
  file = file.replace(/\bto-slate-100\b/g, `to-[#F5F9FC]`);

  // Dark Mode Overrides (replacing mapped theme colors)
  file = file.replace(
    /\bdark:bg-surface\b/g,
    `dark:bg-[${PALETTE.veryDarkNavy}]`,
  );
  file = file.replace(
    /\bdark:bg-surface-dark\b/g,
    `dark:bg-[${PALETTE.veryDarkNavy}]`,
  );
  file = file.replace(
    /\bdark:bg-surface-light\b/g,
    `dark:bg-[${PALETTE.navy}]`,
  );
  file = file.replace(
    /\bdark:bg-surface\/80\b/g,
    `dark:bg-[${PALETTE.veryDarkNavy}]/80`,
  );
  file = file.replace(
    /\bdark:bg-surface\/60\b/g,
    `dark:bg-[${PALETTE.veryDarkNavy}]/60`,
  );
  file = file.replace(
    /\bdark:bg-surface\/50\b/g,
    `dark:bg-[${PALETTE.veryDarkNavy}]/50`,
  );
  file = file.replace(
    /\bdark:from-surface-dark\b/g,
    `dark:from-[${PALETTE.veryDarkNavy}]`,
  );
  file = file.replace(
    /\bdark:to-surface-dark\b/g,
    `dark:to-[${PALETTE.veryDarkNavy}]`,
  );
  file = file.replace(
    /\bdark:from-surface\b/g,
    `dark:from-[${PALETTE.veryDarkNavy}]`,
  );
  file = file.replace(
    /\bdark:to-surface\b/g,
    `dark:to-[${PALETTE.veryDarkNavy}]`,
  );
  file = file.replace(
    /\bdark:via-surface\b/g,
    `dark:via-[${PALETTE.veryDarkNavy}]`,
  );

  file = file.replace(/\bdark:text-text-main\b/g, `dark:text-white`);
  file = file.replace(/\bdark:text-text-muted\b/g, `dark:text-white/70`);
  file = file.replace(/\bdark:text-text-light\b/g, `dark:text-white/90`);

  // Theme Accents (Replacing abstract primary/secondary with exact palette to enforce colors)
  // primary -> skyBlue (#00A8E8)
  // secondary -> oceanBlue (#007EA7)
  // accent -> skyBlue (#00A8E8)

  file = file.replace(/\bbg-primary\b/g, `bg-[${PALETTE.skyBlue}]`);
  file = file.replace(/\bbg-primary\/10\b/g, `bg-[${PALETTE.skyBlue}]/10`);
  file = file.replace(/\bbg-primary\/20\b/g, `bg-[${PALETTE.skyBlue}]/20`);
  file = file.replace(/\bbg-primary\/30\b/g, `bg-[${PALETTE.skyBlue}]/30`);
  file = file.replace(/\bbg-primary\/95\b/g, `bg-[${PALETTE.skyBlue}]/95`);
  file = file.replace(/\btext-primary\b/g, `text-[${PALETTE.skyBlue}]`);
  file = file.replace(/\bborder-primary\b/g, `border-[${PALETTE.skyBlue}]`);
  file = file.replace(
    /\bborder-primary\/20\b/g,
    `border-[${PALETTE.skyBlue}]/20`,
  );
  file = file.replace(
    /\bborder-primary\/30\b/g,
    `border-[${PALETTE.skyBlue}]/30`,
  );
  file = file.replace(
    /\bhover:border-primary\/30\b/g,
    `hover:border-[${PALETTE.skyBlue}]/30`,
  );
  file = file.replace(/\bfrom-primary\b/g, `from-[${PALETTE.skyBlue}]`);
  file = file.replace(/\bto-primary\b/g, `to-[${PALETTE.skyBlue}]`);
  file = file.replace(
    /\bshadow-primary\/30\b/g,
    `shadow-[${PALETTE.skyBlue}]/30`,
  );
  file = file.replace(
    /\bhover:shadow-primary\/50\b/g,
    `hover:shadow-[${PALETTE.skyBlue}]/50`,
  );
  file = file.replace(
    /\bfocus:border-primary\b/g,
    `focus:border-[${PALETTE.skyBlue}]`,
  );
  file = file.replace(
    /\bfocus:ring-primary\b/g,
    `focus:ring-[${PALETTE.skyBlue}]`,
  );
  file = file.replace(
    /\bselection:bg-primary\/30\b/g,
    `selection:bg-[${PALETTE.skyBlue}]/30`,
  );

  file = file.replace(/\bbg-secondary\b/g, `bg-[${PALETTE.oceanBlue}]`);
  file = file.replace(/\bbg-secondary\/20\b/g, `bg-[${PALETTE.oceanBlue}]/20`);
  file = file.replace(/\btext-secondary\b/g, `text-[${PALETTE.oceanBlue}]`);
  file = file.replace(
    /\bborder-secondary\/20\b/g,
    `border-[${PALETTE.oceanBlue}]/20`,
  );
  file = file.replace(
    /\bborder-secondary\/30\b/g,
    `border-[${PALETTE.oceanBlue}]/30`,
  );
  file = file.replace(/\bvia-secondary\b/g, `via-[${PALETTE.oceanBlue}]`);
  file = file.replace(/\bto-secondary\b/g, `to-[${PALETTE.oceanBlue}]`);

  file = file.replace(/\bbg-accent\b/g, `bg-[${PALETTE.skyBlue}]`);
  file = file.replace(/\bbg-accent\/10\b/g, `bg-[${PALETTE.skyBlue}]/10`);
  file = file.replace(/\bbg-accent\/20\b/g, `bg-[${PALETTE.skyBlue}]/20`);
  file = file.replace(/\btext-accent\b/g, `text-[${PALETTE.skyBlue}]`);
  file = file.replace(
    /\bborder-accent\/20\b/g,
    `border-[${PALETTE.skyBlue}]/20`,
  );
  file = file.replace(
    /\bborder-accent\/40\b/g,
    `border-[${PALETTE.skyBlue}]/40`,
  );
  file = file.replace(
    /\bhover:text-accent\b/g,
    `hover:text-[${PALETTE.skyBlue}]`,
  );
  file = file.replace(
    /\bgroup-hover:text-accent\b/g,
    `group-hover:text-[${PALETTE.skyBlue}]`,
  );
  file = file.replace(
    /\bgroup-hover:border-accent\/40\b/g,
    `group-hover:border-[${PALETTE.skyBlue}]/40`,
  );
  file = file.replace(
    /\bgroup-hover:bg-accent\/20\b/g,
    `group-hover:bg-[${PALETTE.skyBlue}]/20`,
  );
  file = file.replace(/\bto-accent\b/g, `to-[${PALETTE.skyBlue}]`);

  // bg-primary-gradient replacement
  file = file.replace(
    /\bbg-primary-gradient\b/g,
    `bg-gradient-to-r from-[${PALETTE.skyBlue}] to-[${PALETTE.oceanBlue}]`,
  );

  // Remove redundant dark specs if they matched
  file = file.replace(
    /dark:bg-\[\#00171F\] dark:bg-\[\#00171F\]\/\d+/g,
    `dark:bg-[${PALETTE.veryDarkNavy}]`,
  );

  fs.writeFileSync(path, file);
}

processFile("./src/pages/common/Home.jsx");
processFile("./src/components/Navbar.jsx");
processFile("./src/index.css");
