/**
 * Advanced Career Engine - Target Domain Edition
 * - Identifies strengths & weaknesses
 * - Analyzes "Fit" vs "Gap" for a specific Target Domain
 * - Outputs structured data for the Result Model
 */

module.exports = function careerEngine(categoryScores, studentLevel = "UG", profileOthers = {}, targetDomain = "General") {
  const strengths = [];
  const weaknesses = [];
  const explanations = [];
  const improvementSuggestions = [];
  const careers = new Set();
  
  // New specific reasoning fields
  let fitReasoning = "";
  let gapReasoning = "";

  const languages = profileOthers.languages || [];
  const hobbies = profileOthers.hobbies || [];
  const skills = profileOthers.skills || [];

  /* ================= 1. BASIC SCORE ANALYSIS ================= */
  categoryScores.forEach((c) => {
    const category = c.category || "General";
    const score = c.percentage;

    if (score >= 70) {
      strengths.push(category);
      switch (category.toLowerCase()) {
        case "logical":
          explanations.push("Strong logical reasoning and analytical thinking observed.");
          careers.add("Data Scientist");
          break;
        case "technical":
          explanations.push("High capacity for understanding complex technical systems.");
          careers.add("Software Developer");
          break;
        case "communication":
          explanations.push("Effective interpersonal skills for leadership roles.");
          careers.add("Project Manager");
          break;
        default:
          explanations.push(`Proficient performance in ${category}.`);
      }
    } else {
      weaknesses.push({
        category: category,
        reason: `Score of ${score}% is below the professional benchmark.`,
        improvementTips: [`Focus on foundational concepts in ${category}.`]
      });
    }
  });

  /* ================= 2. TARGET DOMAIN FITMENT LOGIC ================= */
  // We compare the student's strengths against the requirements of their chosen path
  const domainLower = targetDomain.toLowerCase();

  // Helper to check if a specific category is strong
  const isStrong = (cat) => strengths.some(s => s.toLowerCase() === cat.toLowerCase());

  if (domainLower.includes("computer") || domainLower.includes("it") || domainLower.includes("software")) {
    if (isStrong("technical") && isStrong("logical")) {
      fitReasoning = `You are a great fit for ${targetDomain} because your technical and logical scores align perfectly with software engineering requirements.`;
    } else {
      gapReasoning = `To succeed in ${targetDomain}, you need to significantly improve your ${!isStrong("technical") ? "Technical " : ""}${!isStrong("logical") ? "and Logical " : ""}scores.`;
    }
  } 
  
  else if (domainLower.includes("medical") || domainLower.includes("health")) {
    if (isStrong("logical") && isStrong("communication")) {
      fitReasoning = `Your ability to communicate and analyze logically makes you suitable for the high-pressure environment of ${targetDomain}.`;
    } else {
      gapReasoning = `Healthcare requires high precision. Focus on sharpening your logical analysis to meet ${targetDomain} standards.`;
    }
  }

  else if (domainLower.includes("management") || domainLower.includes("business") || domainLower.includes("finance")) {
    if (isStrong("communication") && isStrong("logical")) {
      fitReasoning = `Your combination of articulate communication and data-driven logic fits the profile of a ${targetDomain} professional.`;
    } else {
      gapReasoning = `Modern ${targetDomain} roles require a stronger balance of communication and analytical skills than currently demonstrated.`;
    }
  }

  else {
    // Default fallback if domain is unique
    if (strengths.length >= 2) {
      fitReasoning = `Your diverse strengths in ${strengths.join(", ")} provide a solid foundation for pursuing ${targetDomain}.`;
    } else {
      gapReasoning = `We recommend building a broader skill base in your core categories before specializing in ${targetDomain}.`;
    }
  }

  /* ================= 3. CAREER REFINEMENT ================= */
  const designInterests = hobbies.some(h => h.toLowerCase().includes("design") || h.toLowerCase().includes("art"));
  if (designInterests && isStrong("Technical")) {
    careers.add("UX/UI Designer");
  }

  if (careers.size === 0) careers.add("Junior Associate");

  return {
    strengths,
    weaknesses,
    explanations,
    improvementSuggestions,
    fitReasoning, // New field
    gapReasoning, // New field
    recommendedCareers: Array.from(careers),
    generatedAt: new Date().toISOString()
  };
};