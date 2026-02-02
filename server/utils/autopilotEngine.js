const Batch = require("../models/Batch");
const Assessment = require("../models/Assessment");
const User = require("../models/User");
const Institution = require("../models/Institution");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * REDESIGN: AI behaves like an Admin using Persistent Policies.
 * 1. Validates Admin Policy (Autopilot must be ACTIVE).
 * 2. Sequential Step 1: Handle Batch (Create if missing or full).
 * 3. Sequential Step 2: Handle Assessment (Generate one per batch).
 */
exports.ensureStudentReady = async (userId, config) => {
  const { targetDomain, educationLevel, isOther } = config;
  
  const user = await User.findById(userId);
  if (!user || !user.institutionId) return { error: "User or Institution not found" };

  // 1. Fetch the Admin's Persistent Policy 
  const inst = await Institution.findById(user.institutionId);
  if (!inst?.autopilot?.active) {
    return { locked: true, message: "Autopilot is currently disabled by Admin." };
  }

  const policy = inst.autopilot.settings;

  // 2. STEP 1: BATCH CREATION LOGIC 
  // Search for an existing batch with room based on policy.batchLimit
  let batch = await Batch.findOne({
    institutionId: user.institutionId,
    educationLevel: educationLevel,
    targetDomain: targetDomain,
    creationType: "autopilot",
    isActive: true,
    $expr: { $lt: [{ $size: "$students" }, policy?.batchLimit || 500] } 
  });

  // If no batch exists for this Level + Domain, AI creates it 
  if (!batch) {
    const timestamp = Date.now();
    const batchCode = isOther ? "CUSTOM" : educationLevel.toUpperCase();
    
    batch = await Batch.create({
      batchId: `AUTO-${batchCode}-${timestamp}`,
      name: `AI Batch - ${educationLevel} (${targetDomain})`,
      className: educationLevel,
      educationLevel: educationLevel,
      targetDomain: targetDomain, 
      institutionId: user.institutionId,
      createdBy: inst.createdBy, 
      creationType: "autopilot",
      slot: {
        date: new Date().toISOString().split('T')[0],
        startTime: "00:00",
        endTime: "23:59"
      },
      maxStudents: policy.batchLimit || 500 
    });

    // RULE 4: Return immediate message if batch was just created 
    return { locked: true, message: "Please wait while we assign you to a batch." };
  }

  // Assign student to the existing batch if not already assigned
  if (user.batchId !== batch.batchId) {
    user.batchId = batch.batchId;
    user.batchRef = batch._id;
    await user.save();
    
    if (!batch.students.includes(user._id)) {
      batch.students.push(user._id);
      await batch.save();
    }
  }

  // 3. STEP 2: ASSESSMENT CREATION LOGIC 
  // Rule: Check if batch already has its one assessment
  let assessment = await Assessment.findOne({ batchId: batch.batchId });
  
  if (!assessment) {
    // RULE 5: Return message if assessment is currently being prepared 
    // Note: To avoid multiple parallel AI calls, we can trigger the async generation here
    const questionsPerCat = policy.questionsPerCategory || 10;
    const categories = ["Logic", "GK", "Aptitude", "Technical"]; 
    const totalQuestions = questionsPerCat * categories.length;

    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash", // Reverting to stable flash for speed
        generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      Generate a professional assessment for ${educationLevel} level in the domain of ${targetDomain}.
      Admin Requirements:
      - Category Questions: ${questionsPerCat} for EACH category
      - Categories: ${categories.join(", ")}
      - Total: ${totalQuestions} questions
      ${policy.prompt ? `- Admin Instructions: ${policy.prompt}` : ""}
      
      JSON Format: [{"question": "string", "options": ["string"], "correctAnswer": "string", "category": "string"}]
    `;

    try {
        const result = await model.generateContent(prompt);
        const questions = JSON.parse(result.response.text());

        assessment = await Assessment.create({
            batchId: batch.batchId,
            institutionId: user.institutionId,
            createdBy: inst.createdBy,
            mode: "autopilot",
            source: "autopilot",
            categories: categories,
            difficulty: "medium",
            questionCount: questions.length,
            timeLimit: policy.timeLimit || 60,
            // Calculate time per question in seconds
            timePerQuestion: Math.floor(((policy.timeLimit || 60) * 60) / questions.length),
            questions: questions,
            slot: batch.slot 
        });

        batch.assessmentId = assessment._id;
        await batch.save();

        return { locked: true, message: "Assessment is being prepared. Please wait for some time." };
    } catch (err) {
        console.error("Autopilot Engine Error:", err.message);
        return { locked: true, message: "AI is currently preparing questions. Try again in a moment." };
    }
  }

  // 4. Everything ready 
  return { locked: false, batch, assessment };
};