import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Profile from "@/models/Profile";
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

    // Update user information (name, email)
    const userUpdate = {};
    if (profileData.firstName) userUpdate.firstName = profileData.firstName;
    if (profileData.lastName) userUpdate.lastName = profileData.lastName;
    if (profileData.email) userUpdate.email = profileData.email;

    // Update user record if there are user fields to update
    if (Object.keys(userUpdate).length > 0) {
      const user = await User.findByIdAndUpdate(decoded.userId, userUpdate, {
        new: true,
      }).select("-password");

      if (!user) {
        return Response.json({ error: "User not found" }, { status: 404 });
      }
    }

    // Find or create profile
    let profile = await Profile.findOne({ userId: decoded.userId });

    if (profile) {
      // Update existing profile with additional data
      if (profileData.phone !== undefined) profile.phone = profileData.phone;
      if (profileData.bio !== undefined) profile.bio = profileData.bio;
      if (profileData.skills !== undefined) profile.skills = profileData.skills;
      if (profileData.jobProfile !== undefined)
        profile.jobProfile = profileData.jobProfile;

      // Update jobRole.target if provided, or ensure it has a value
      if (profileData.jobProfile !== undefined) {
        profile.jobRole = profile.jobRole || {};
        profile.jobRole.target = profileData.jobProfile;
      } else if (!profile.jobRole?.target) {
        profile.jobRole = profile.jobRole || {};
        profile.jobRole.target = profile.jobProfile || "Software Engineer";
      }

      if (profileData.experience !== undefined) {
        if (typeof profileData.experience === "string") {
          // If experience is a string, treat it as experience level
          profile.experience = profile.experience || {};
          profile.experience.level = profileData.experience;
        } else if (typeof profileData.experience === "object") {
          // If experience is an object, merge it
          profile.experience = {
            ...profile.experience,
            ...profileData.experience,
          };
        }
      }

      // Ensure experience.level has a default value if not set
      if (!profile.experience?.level) {
        profile.experience = profile.experience || {};
        profile.experience.level = "Entry Level (0-2 years)";
      }

      profile.lastUpdated = new Date();
      await profile.save();
    } else {
      // Create new profile with basic structure
      const user = await User.findById(decoded.userId);
      if (!user) {
        return Response.json({ error: "User not found" }, { status: 404 });
      }

      profile = new Profile({
        userId: decoded.userId,
        fullName: `${user.firstName} ${user.lastName}`,
        jobProfile: profileData.jobProfile || "Software Engineer", // Provide default
        experience: {
          level:
            typeof profileData.experience === "string"
              ? profileData.experience
              : "Entry Level (0-2 years)",
          years: 0,
          description: "",
        },
        techStack: {
          primary: Array.isArray(profileData.skills) ? profileData.skills : [],
          secondary: [],
          frameworks: [],
          databases: [],
          tools: [],
        },
        jobRole: {
          current: "",
          target: profileData.jobProfile || "Software Engineer", // Provide default for required field
          industry: "Technology",
          companySize: "Startup (1-50)",
        },
        preferences: {
          interviewTypes: [],
          difficulty: "Intermediate",
          duration: 30,
        },
        phone: profileData.phone || "",
        bio: profileData.bio || "",
        skills: profileData.skills || [],
        strengths: [],
        weaknesses: [],
        goals: [],
        isComplete: false,
      });

      await profile.save();
    }

    return Response.json({
      success: true,
      message: "Profile saved successfully",
      profile: {
        id: profile._id,
        fullName: profile.fullName,
        phone: profile.phone || "",
        bio: profile.bio || "",
        skills: profile.skills || [],
        experience: profile.experience,
        isComplete: profile.isComplete,
      },
    });
  } catch (error) {
    console.error("Profile save error:", error);
    console.error("Error stack:", error.stack);

    return Response.json(
      {
        success: false,
        error: "Internal server error",
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
