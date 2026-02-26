/**
 * Advanced Career Engine - Aptitude & Potential Edition
 * - Analyzes foundational aptitudes (Logic, Technical, Communication, Aptitude/Problem Solving)
 * - Uses combinatorial logic (e.g., High Logic + High Communication = Product Manager)
 * - Outputs deep, structured insights for the Result Model
 */

module.exports = function careerEngine(
  categoryScores,
  studentLevel = "UG",
  profileOthers = {},
  targetDomain = "General",
) {
  const strengths = [];
  const weaknesses = [];
  const explanations = [];
  const improvementSuggestions = [];
  const careers = new Set();

  let fitReasoning = "";
  let gapReasoning = "";

  const languages = profileOthers.languages || [];
  const hobbies = profileOthers.hobbies || [];
  const skills = profileOthers.skills || [];

  // 1. DYNAMIC CATEGORY SCORING
  const scoreMap = {};
  categoryScores.forEach((c) => {
    const cat = (c.category || "General").toLowerCase();
    scoreMap[cat] = c.percentage;

    if (c.percentage >= 70) {
      strengths.push(cat);
      if (c.percentage >= 85) {
        explanations.push(
          `Exceptional mastery in ${cat} indicates high natural aptitude.`,
        );
      }
    } else {
      weaknesses.push({
        category: cat,
        reason: `Score of ${c.percentage}% indicates a foundational gap.`,
        improvementTips: [
          `Focus on core principles and practice exercises in ${cat}.`,
        ],
      });
      improvementSuggestions.push(
        `Practice foundational ${cat} exercises to build baseline readiness.`,
      );
    }
  });

  const isStrong = (cat) => strengths.includes(cat.toLowerCase());
  const getScore = (cat) => scoreMap[cat.toLowerCase()] || 0;

  // 2. COMBINATORIAL CAREER MAPPING
  // We use combination matrices rather than single-trait mapping

  // Logic + Domain Intuition = Engineering / Data
  if (isStrong("logic") && isStrong("domain intuition")) {
    careers.add("Software Engineer");
    careers.add("Data Scientist");
    careers.add("Systems Architect");
    explanations.push(
      "Your combination of Logic and Domain Intuition makes you highly suited for complex engineering roles.",
    );
  }

  // Logic + Communication = Product / Consulting
  if (isStrong("logic") && isStrong("communication")) {
    careers.add("Product Manager");
    careers.add("Management Consultant");
    careers.add("Business Analyst");
    explanations.push(
      "Your blend of analytical logic and communication is the exact profile needed for strategic product and business roles.",
    );
  }

  // Domain Intuition + Communication = DevRel / Solutions Architecture
  if (isStrong("domain intuition") && isStrong("communication")) {
    careers.add("Developer Advocate");
    careers.add("Solutions Architect");
    careers.add("Technical Sales Engineer");
    explanations.push(
      "Excelling in both domain-specific execution and communication makes you perfect for bridging the gap between engineers and clients.",
    );
  }

  // General Aptitude + Anything = Versatile Roles
  if (isStrong("aptitude")) {
    if (isStrong("communication"))
      careers.add("Growth Hacker / Marketing Strategist");
    if (isStrong("domain intuition")) careers.add("Cybersecurity Analyst");
    if (isStrong("logic")) careers.add("Operations Research Analyst");
  }

  // 3. TARGET DOMAIN FITMENT (Aptitude Based)
  const domainLower = targetDomain.toLowerCase();

  const evaluateFit = (requiredTraits, domainName) => {
    const missing = requiredTraits.filter((t) => !isStrong(t));
    if (missing.length === 0) {
      fitReasoning = `You show exceptional innate potential for ${domainName}. Your natural aptitude in ${requiredTraits.join(" and ")} perfectly aligns with the foundational requirements of this field.`;
    } else if (missing.length === 1) {
      fitReasoning = `You have strong foundations for ${domainName}, but pushing your ${missing[0]} skills will turn you into a top-tier candidate.`;
      gapReasoning = `To naturally excel in ${domainName}, you need to close the gap in your ${missing[0]} aptitude through targeted practice.`;
    } else {
      gapReasoning = `${domainName} requires strong baseline skills in ${requiredTraits.join(" and ")}. Currently, your aptitude profile suggests you might find this path highly challenging without significant foundational rework in those areas.`;
    }
  };

  if (
    domainLower.includes("software") ||
    domainLower.includes("computer") ||
    domainLower.includes("it")
  ) {
    evaluateFit(["domain intuition", "logic"], targetDomain);
  } else if (
    domainLower.includes("data") ||
    domainLower.includes("ai") ||
    domainLower.includes("machine")
  ) {
    evaluateFit(["logic", "aptitude"], targetDomain);
  } else if (
    domainLower.includes("product") ||
    domainLower.includes("management") ||
    domainLower.includes("business")
  ) {
    evaluateFit(["logic", "communication"], targetDomain);
  } else if (
    domainLower.includes("medical") ||
    domainLower.includes("health")
  ) {
    evaluateFit(["logic", "aptitude"], targetDomain);
  } else if (
    domainLower.includes("design") ||
    domainLower.includes("ui") ||
    domainLower.includes("ux")
  ) {
    evaluateFit(["aptitude", "communication"], targetDomain);
  } else {
    // Generic fallback for unknown domains
    if (strengths.length >= 2) {
      fitReasoning = `Your diverse cognitive strengths provide a solid, adaptable foundation for pursuing ${targetDomain}.`;
    } else {
      gapReasoning = `Before specializing in ${targetDomain}, we strongly recommend building your core problem-solving and logical baselines.`;
    }
  }

  // 4. FALLBACKS & REFINEMENT
  if (careers.size === 0) {
    if (strengths.length > 0) {
      careers.add(
        `${strengths[0].charAt(0).toUpperCase() + strengths[0].slice(1)} Specialist`,
      );
    } else {
      careers.add("General Analyst");
      careers.add("Junior Associate");
      explanations.push(
        "We recommend exploring a broad set of introductory courses to discover where your natural talents lie.",
      );
    }
  }

  // Title case careers and return
  return {
    strengths: strengths.map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
    weaknesses,
    explanations,
    improvementSuggestions,
    fitReasoning,
    gapReasoning,
    recommendedCareers: Array.from(careers),
    generatedAt: new Date().toISOString(),
  };
};
