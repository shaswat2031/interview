import dbConnect from "@/lib/mongodb";
import Profile from "@/models/Profile";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { validateEnvVars } from "@/lib/validateEnv";

export async function POST(request) {
  try {
    // Validate environment variables
    validateEnvVars();

    await dbConnect();

    // Get token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const profileData = await request.json();

    // Check if profile already exists
    let profile = await Profile.findOne({ userId: decoded.userId });

    if (profile) {
      // Update existing profile
      Object.assign(profile, profileData);
      profile.checkCompletion();
      await profile.save();
    } else {
      // Create new profile
      profile = new Profile({
        userId: decoded.userId,
        ...profileData,
      });
      profile.checkCompletion();
      await profile.save();
    }

    // Update user's profileComplete status
    await User.findByIdAndUpdate(decoded.userId, {
      profileComplete: profile.isComplete,
    });

    return Response.json({
      message: "Profile saved successfully",
      profile: {
        id: profile._id,
        isComplete: profile.isComplete,
        fullName: profile.fullName,
        jobProfile: profile.jobProfile,
        targetRole: profile.jobRole.target,
        experience: profile.experience.level,
      },
    });
  } catch (error) {
    console.error("Profile setup error:", error);
    console.error("Error stack:", error.stack);

    // Return more specific error information for debugging
    return Response.json(
      {
        error: "Internal server error",
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    // Validate environment variables
    validateEnvVars();

    await dbConnect();

    // Get token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let profile = await Profile.findOne({ userId: decoded.userId });

    if (!profile) {
      // Get user info to create a basic profile
      const user = await User.findById(decoded.userId);
      if (!user) {
        return Response.json({ error: "User not found" }, { status: 404 });
      }

      // Create a basic profile with default values
      profile = new Profile({
        userId: decoded.userId,
        fullName: `${user.firstName} ${user.lastName}`,
        jobProfile: "", // Will be filled by user
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
        strengths: [],
        weaknesses: [],
        goals: [],
        isComplete: false,
      });

      await profile.save();
    }

    return Response.json(profile);
  } catch (error) {
    console.error("Get profile error:", error);
    console.error("Error stack:", error.stack);

    return Response.json(
      {
        error: "Internal server error",
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
