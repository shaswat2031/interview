import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Interview from "../../../../models/Interview";
import User from "../../../../models/User";
import dbConnect from "../../../lib/mongodb";

export async function POST(request) {
  try {
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

    // Get user from database
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const interviewData = await request.json();

    // Debug: Log the interview data being sent
    console.log("Interview Data:", JSON.stringify(interviewData, null, 2));

    // Validate required fields
    if (
      !interviewData.type ||
      !interviewData.company ||
      !interviewData.questions
    ) {
      return NextResponse.json(
        {
          error: "Interview type, company, and questions are required",
        },
        { status: 400 }
      );
    }

    // Create new interview session
    const interview = new Interview({
      userId: user._id,
      type: interviewData.type,
      company: interviewData.company,
      jobTitle: interviewData.jobTitle,
      difficulty: interviewData.difficulty,
      duration: interviewData.duration,
      focus: interviewData.focus,
      customRequirements: interviewData.customRequirements,
      questions: interviewData.questions.map((q) => ({
        question: q.question,
        category: q.category,
        context: q.context,
        difficulty: q.difficulty,
        estimatedTime:
          typeof q.estimatedTime === "string"
            ? parseInt(q.estimatedTime.replace(/\D/g, "")) || 5
            : q.estimatedTime || 5,
        order: q.order,
      })),
      status: "scheduled",
      createdAt: new Date(),
      scheduledFor: new Date(),
    });

    console.log(
      "Interview object before save:",
      JSON.stringify(interview.toObject(), null, 2)
    );

    await interview.save();
    console.log("Interview saved successfully with ID:", interview._id);

    // Update user's last login time
    await User.findByIdAndUpdate(user._id, {
      $set: { lastLoginAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      interviewId: interview._id,
      message: "Interview session created successfully",
    });
  } catch (error) {
    console.error("Interview creation error:", error);
    return NextResponse.json(
      {
        error: "Failed to create interview session",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
