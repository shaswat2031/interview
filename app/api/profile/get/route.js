import dbConnect from "@/lib/mongodb";
import Profile from "@/models/Profile";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await dbConnect();

    // Get token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user to get basic info
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find profile by userId
    const profile = await Profile.findOne({ userId: decoded.userId });

    if (!profile) {
      // Return user data with default profile structure if no profile exists
      return NextResponse.json({
        success: true,
        profile: {
          fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          jobProfile: "",
          experience: {
            level: "Entry Level (0-2 years)",
            years: 0,
            description: "",
          },
          techStack: {
            primary: [],
            secondary: [],
            frameworks: [],
            databases: [],
            tools: [],
          },
          jobRole: {
            current: "",
            target: "",
            industry: "Technology",
            companySize: "Startup (1-50)",
          },
          preferences: {
            interviewTypes: [],
            difficulty: "Intermediate",
            duration: 30,
          },
          isComplete: false,
        },
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      });
    }

    return NextResponse.json({
      success: true,
      profile: profile,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching profile" },
      { status: 500 }
    );
  }
}
