import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Interview from "../../../../../models/Interview";
import User from "../../../../../models/User";
import dbConnect from "../../../../lib/mongodb";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request, { params }) {
  try {
    const { id } = await params;

    // Get token from header
    const authorization = request.headers.get("authorization");
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authorization.split(" ")[1];

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await dbConnect();

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { error: "Invalid interview ID format" },
        { status: 400 }
      );
    }

    // Find interview and verify ownership
    const interview = await Interview.findById(id);
    console.log("Found interview:", interview ? "YES" : "NO", "ID:", id);

    if (!interview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    if (interview.userId.toString() !== decoded.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { answers, elapsedTime, completedAt } = await request.json();

    // Update interview with answers and completion details
    interview.answers = answers;
    interview.timeSpent = elapsedTime;
    interview.completedAt = new Date(completedAt);
    interview.status = "completed";

    // Calculate detailed question-wise scores and provide proper analysis
    const detailedScoring = await calculateDetailedScores(interview, answers);

    // Update each question with its individual score and feedback
    interview.questions.forEach((question, index) => {
      const questionScore = detailedScoring.questionScores[index];
      if (questionScore) {
        question.score = questionScore.score;
        question.feedback = questionScore.feedback;
        question.aiAnalysis = questionScore.analysis;
        question.answer = answers[index] || "No answer provided";
      }
    });

    // Calculate overall score based on question-wise scores
    const totalPossibleScore = interview.questions.length * 10; // Max 10 points per question
    const actualScore = detailedScoring.questionScores.reduce(
      (sum, q) => sum + (q.score || 0),
      0
    );
    interview.score = Math.round((actualScore / totalPossibleScore) * 10); // Overall score out of 10

    // Generate AI feedback with question-wise analysis
    const aiFeedback = await generateAIFeedback(
      interview,
      answers,
      detailedScoring
    );

    // Validate and sanitize feedback structure
    interview.feedback = {
      strengths: Array.isArray(aiFeedback.strengths)
        ? aiFeedback.strengths
        : [],
      weaknesses: Array.isArray(aiFeedback.weaknesses)
        ? aiFeedback.weaknesses
        : [],
      recommendations: Array.isArray(aiFeedback.recommendations)
        ? aiFeedback.recommendations
        : [],
      overallFeedback:
        typeof aiFeedback.overallFeedback === "string"
          ? aiFeedback.overallFeedback
          : "",
      aiScore:
        typeof aiFeedback.aiScore === "number"
          ? aiFeedback.aiScore
          : interview.score,
      detailedAnalysis:
        typeof aiFeedback.detailedAnalysis === "string"
          ? aiFeedback.detailedAnalysis
          : "",
    };

    console.log(
      "Detailed scoring results:",
      JSON.stringify(detailedScoring, null, 2)
    );
    console.log(
      "Feedback structure before save:",
      JSON.stringify(interview.feedback, null, 2)
    );

    await interview.save();

    // Update user's last activity and decrement interviews left count
    const user = await User.findById(decoded.userId);
    if (user && user.interviewsLeft > 0) {
      user.interviewsLeft -= 1;
      user.lastLoginAt = new Date();
      await user.save();
    } else {
      await User.findByIdAndUpdate(decoded.userId, {
        $set: { lastLoginAt: new Date() },
      });
    }

    return NextResponse.json({
      success: true,
      score: interview.score,
      message: "Interview completed successfully",
    });
  } catch (error) {
    console.error("Complete interview error:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        error: "Failed to complete interview",
        details: error.message,
        type: error.name,
      },
      { status: 500 }
    );
  }
}

async function calculateDetailedScores(interview, answers) {
  try {
    const questionScores = [];

    for (let i = 0; i < interview.questions.length; i++) {
      const question = interview.questions[i];
      const userAnswer = answers[i] || "No answer provided";

      // Generate AI scoring for each question
      const questionAnalysis = await generateQuestionAnalysis(
        question,
        userAnswer,
        interview
      );
      questionScores.push(questionAnalysis);
    }

    return { questionScores };
  } catch (error) {
    console.error("Error calculating detailed scores:", error);
    // Fallback scoring
    return {
      questionScores: interview.questions.map((q, index) => ({
        score:
          answers[index] && answers[index].toString().trim().length > 10
            ? 5
            : 0,
        feedback: answers[index]
          ? "Answer provided but detailed analysis unavailable"
          : "No answer provided",
        analysis: "Detailed analysis temporarily unavailable",
      })),
    };
  }
}

async function generateQuestionAnalysis(question, userAnswer, interview) {
  try {
    const analysisPrompt = `You are an expert interview evaluator. Analyze this specific interview question and answer.

QUESTION DETAILS:
- Question: ${question.question}
- Category: ${question.category}
- Difficulty: ${question.difficulty}
- Context: ${question.context || "General interview question"}

USER'S ANSWER:
${userAnswer}

INTERVIEW CONTEXT:
- Type: ${interview.type}
- Company: ${interview.company}
- Job Title: ${interview.jobTitle || "Not specified"}
- Overall Difficulty: ${interview.difficulty}

Please provide a detailed analysis in the following JSON format:
{
  "score": score_out_of_10,
  "feedback": "Specific feedback on this answer - what was good, what was missing",
  "analysis": "Detailed analysis including: 1) What the ideal answer should cover, 2) How the user's answer compares, 3) Specific areas for improvement, 4) Key points that were missed",
  "correctAnswer": "What a strong answer should include (key points, frameworks, examples)",
  "strengths": ["Specific strengths in this answer"],
  "improvements": ["Specific areas to improve for this type of question"]
}

SCORING CRITERIA:
- 9-10: Exceptional answer, demonstrates deep understanding, well-structured, includes examples
- 7-8: Good answer, covers most key points, shows understanding
- 5-6: Average answer, covers some points but lacks depth or structure
- 3-4: Below average, misses key points or shows limited understanding
- 1-2: Poor answer, significant gaps or misconceptions
- 0: No answer or completely incorrect

Focus on:
1. Technical accuracy and completeness
2. Structure and clarity of communication
3. Use of relevant examples or frameworks
4. Depth of understanding demonstrated
5. Relevance to the role and company`;

    let model;
    let result;

    try {
      model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      result = await model.generateContent(analysisPrompt);
    } catch (error) {
      console.log("Failed with gemini-1.5-flash, trying gemini-1.5-pro...");
      model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      result = await model.generateContent(analysisPrompt);
    }

    const response = await result.response;
    const text = response.text();

    // Parse the AI response
    return parseQuestionAnalysis(text, userAnswer);
  } catch (error) {
    console.error("Error generating question analysis:", error);
    return {
      score: userAnswer && userAnswer.toString().trim().length > 10 ? 5 : 0,
      feedback: userAnswer
        ? "Answer provided but AI analysis unavailable"
        : "No answer provided",
      analysis:
        "Detailed analysis temporarily unavailable due to technical issues",
    };
  }
}

function parseQuestionAnalysis(text, userAnswer) {
  try {
    // Try to parse as JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      return {
        score:
          typeof analysis.score === "number"
            ? Math.max(0, Math.min(10, analysis.score))
            : 0,
        feedback:
          typeof analysis.feedback === "string"
            ? analysis.feedback
            : "Analysis unavailable",
        analysis:
          typeof analysis.analysis === "string"
            ? analysis.analysis
            : typeof analysis.analysis === "object"
            ? JSON.stringify(analysis.analysis)
            : "Analysis unavailable",
        correctAnswer:
          analysis.correctAnswer || "Correct answer details not available",
        strengths: Array.isArray(analysis.strengths) ? analysis.strengths : [],
        improvements: Array.isArray(analysis.improvements)
          ? analysis.improvements
          : [],
      };
    }
  } catch (error) {
    console.log("JSON parsing failed for question analysis, using fallback");
  }

  // Fallback analysis
  const hasAnswer = userAnswer && userAnswer.toString().trim().length > 10;
  return {
    score: hasAnswer ? 5 : 0,
    feedback: hasAnswer
      ? "Answer provided but detailed analysis format error"
      : "No answer provided",
    analysis: hasAnswer ? text : "No answer provided for analysis",
    correctAnswer: "Analysis format error - correct answer not available",
    strengths: [],
    improvements: [],
  };
}

async function generateAIFeedback(interview, answers, detailedScoring) {
  try {
    // Build feedback prompt with question-wise analysis
    const feedbackPrompt = buildEnhancedFeedbackPrompt(
      interview,
      answers,
      detailedScoring
    );

    // Generate feedback using Gemini
    let model;
    let result;

    try {
      model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      result = await model.generateContent(feedbackPrompt);
    } catch (error) {
      console.log("Failed with gemini-1.5-flash, trying gemini-1.5-pro...");
      model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      result = await model.generateContent(feedbackPrompt);
    }

    const response = await result.response;
    const text = response.text();

    // Parse feedback response
    return parseFeedbackResponse(text, interview);
  } catch (error) {
    console.error("Error generating AI feedback:", error);
    return {
      strengths: ["Completed the interview"],
      weaknesses: ["Unable to generate detailed feedback"],
      recommendations: ["Practice more interviews"],
      overallFeedback:
        "Thank you for completing the interview. Keep practicing to improve your skills!",
      aiScore: interview.score,
      detailedAnalysis:
        "AI feedback temporarily unavailable due to technical issues.",
    };
  }
}

function buildEnhancedFeedbackPrompt(interview, answers, detailedScoring) {
  const questionsAndAnalysis = interview.questions.map((q, index) => {
    const scoring = detailedScoring.questionScores[index];
    return {
      question: q.question,
      category: q.category,
      expectedLevel: q.difficulty,
      userAnswer: answers[index] || "No answer provided",
      score: scoring?.score || 0,
      feedback: scoring?.feedback || "No analysis available",
      analysis: scoring?.analysis || "No detailed analysis available",
    };
  });

  return `You are an expert interview coach providing comprehensive feedback on an interview performance.

INTERVIEW DETAILS:
- Type: ${interview.type}
- Company: ${interview.company}
- Job Title: ${interview.jobTitle || "Not specified"}
- Difficulty: ${interview.difficulty}
- Duration: ${interview.duration} minutes
- Time Spent: ${Math.round(interview.timeSpent / 60)} minutes

QUESTION-WISE PERFORMANCE:
${questionsAndAnalysis
  .map(
    (qa, index) => `
Question ${index + 1} (${qa.category} - ${qa.expectedLevel}):
${qa.question}

User Answer: ${qa.userAnswer}
Score: ${qa.score}/10
Individual Feedback: ${qa.feedback}
Analysis: ${qa.analysis}
`
  )
  .join("\n")}

OVERALL SCORING:
- Questions Answered: ${
    questionsAndAnalysis.filter((q) => q.userAnswer !== "No answer provided")
      .length
  }/${interview.questions.length}
- Average Score: ${(
    questionsAndAnalysis.reduce((sum, q) => sum + q.score, 0) /
    questionsAndAnalysis.length
  ).toFixed(1)}/10
- Total Points: ${questionsAndAnalysis.reduce((sum, q) => sum + q.score, 0)}/${
    questionsAndAnalysis.length * 10
  }

Please provide comprehensive feedback in the following JSON format:
{
  "strengths": ["List of 3-5 specific strengths demonstrated across all questions"],
  "weaknesses": ["List of 3-5 areas for improvement based on question performance"],
  "recommendations": ["List of 3-5 specific actionable recommendations for improvement"],
  "overallFeedback": "A detailed 2-3 paragraph overall assessment including question-wise performance summary",
  "aiScore": overall_score_out_of_10,
  "detailedAnalysis": "Comprehensive analysis including: 1) Performance patterns across questions, 2) Category-wise strengths/weaknesses, 3) Communication style assessment, 4) Technical depth evaluation"
}

Focus on:
1. Question-wise performance patterns and trends
2. Technical accuracy and depth across different categories
3. Communication clarity and structure consistency
4. Problem-solving approach demonstrated
5. Areas showing strong performance vs. areas needing improvement
6. Specific examples from their answers to support feedback
7. Actionable steps for improvement based on actual performance

Be constructive, encouraging, and specific in your feedback, referencing actual questions and answers.`;
}

function parseFeedbackResponse(text, interview) {
  try {
    // Try to parse as JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const feedback = JSON.parse(jsonMatch[0]);
      return {
        strengths: Array.isArray(feedback.strengths) ? feedback.strengths : [],
        weaknesses: Array.isArray(feedback.weaknesses)
          ? feedback.weaknesses
          : [],
        recommendations: Array.isArray(feedback.recommendations)
          ? feedback.recommendations
          : [],
        overallFeedback:
          typeof feedback.overallFeedback === "string"
            ? feedback.overallFeedback
            : "",
        aiScore:
          typeof feedback.aiScore === "number"
            ? feedback.aiScore
            : interview.score,
        detailedAnalysis:
          typeof feedback.detailedAnalysis === "string"
            ? feedback.detailedAnalysis
            : typeof feedback.detailedAnalysis === "object"
            ? JSON.stringify(feedback.detailedAnalysis)
            : "",
      };
    }
  } catch (error) {
    console.log("JSON parsing failed for feedback, using text parsing");
  }

  // Fallback parsing
  const lines = text.split("\n").filter((line) => line.trim());
  const feedback = {
    strengths: [],
    weaknesses: [],
    recommendations: [],
    overallFeedback: "",
    aiScore: interview.score,
    detailedAnalysis: text,
  };

  let currentSection = "";
  for (const line of lines) {
    if (line.toLowerCase().includes("strength")) {
      currentSection = "strengths";
    } else if (
      line.toLowerCase().includes("weakness") ||
      line.toLowerCase().includes("improvement")
    ) {
      currentSection = "weaknesses";
    } else if (line.toLowerCase().includes("recommendation")) {
      currentSection = "recommendations";
    } else if (line.toLowerCase().includes("overall")) {
      currentSection = "overall";
    } else if (currentSection && line.trim().startsWith("-")) {
      const item = line.replace(/^-\s*/, "").trim();
      if (currentSection === "strengths") feedback.strengths.push(item);
      else if (currentSection === "weaknesses") feedback.weaknesses.push(item);
      else if (currentSection === "recommendations")
        feedback.recommendations.push(item);
    } else if (currentSection === "overall" && line.trim()) {
      feedback.overallFeedback += line.trim() + " ";
    }
  }

  return feedback;
}
