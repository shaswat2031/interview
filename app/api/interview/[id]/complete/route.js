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
    const { id } = params;

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

    // Calculate a basic score (this can be enhanced with AI evaluation)
    const totalQuestions = interview.questions.length;
    const answeredQuestions = Object.values(answers).filter(
      (answer) => answer && answer.toString().trim().length > 10
    ).length;

    interview.score = Math.round((answeredQuestions / totalQuestions) * 10); // Score out of 10

    // Generate AI feedback
    const aiFeedback = await generateAIFeedback(interview, answers);
    interview.feedback = aiFeedback;

    await interview.save();

    // Update user's last activity
    await User.findByIdAndUpdate(decoded.userId, {
      $set: { lastLoginAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      score: interview.score,
      message: "Interview completed successfully",
    });
  } catch (error) {
    console.error("Complete interview error:", error);
    return NextResponse.json(
      {
        error: "Failed to complete interview",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

async function generateAIFeedback(interview, answers) {
  try {
    // Build feedback prompt
    const feedbackPrompt = buildFeedbackPrompt(interview, answers);

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
      detailedAnalysis: "AI feedback temporarily unavailable.",
    };
  }
}

function buildFeedbackPrompt(interview, answers) {
  const questionsAndAnswers = interview.questions.map((q, index) => ({
    question: q.question,
    category: q.category,
    expectedLevel: q.difficulty,
    userAnswer: answers[index] || "No answer provided",
  }));

  return `You are an expert interview coach providing detailed feedback on an interview performance.

INTERVIEW DETAILS:
- Type: ${interview.type}
- Company: ${interview.company}
- Job Title: ${interview.jobTitle || "Not specified"}
- Difficulty: ${interview.difficulty}
- Duration: ${interview.duration} minutes
- Time Spent: ${Math.round(interview.timeSpent / 60)} minutes

QUESTIONS AND ANSWERS:
${questionsAndAnswers
  .map(
    (qa, index) => `
Question ${index + 1} (${qa.category} - ${qa.expectedLevel}):
${qa.question}

Answer: ${qa.userAnswer}
`
  )
  .join("\n")}

Please provide comprehensive feedback in the following JSON format:
{
  "strengths": ["List of 3-5 specific strengths demonstrated"],
  "weaknesses": ["List of 3-5 areas for improvement"],
  "recommendations": ["List of 3-5 specific actionable recommendations"],
  "overallFeedback": "A detailed 2-3 paragraph overall assessment",
  "aiScore": score_out_of_10,
  "detailedAnalysis": "Detailed analysis of each answer and overall performance"
}

Focus on:
1. Technical accuracy and depth of answers
2. Communication clarity and structure
3. Problem-solving approach
4. Relevance to the role and company
5. Areas for improvement with specific suggestions
6. Positive reinforcement of good practices

Be constructive, encouraging, and specific in your feedback.`;
}

function parseFeedbackResponse(text, interview) {
  try {
    // Try to parse as JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const feedback = JSON.parse(jsonMatch[0]);
      return {
        strengths: feedback.strengths || [],
        weaknesses: feedback.weaknesses || [],
        recommendations: feedback.recommendations || [],
        overallFeedback: feedback.overallFeedback || "",
        aiScore: feedback.aiScore || interview.score,
        detailedAnalysis: feedback.detailedAnalysis || "",
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
