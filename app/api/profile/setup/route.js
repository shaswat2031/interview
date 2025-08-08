import dbConnect from "@/lib/mongodb";
import Profile from "@/models/Profile";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
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
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    await dbConnect();

    // Get token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const profile = await Profile.findOne({ userId: decoded.userId });

    if (!profile) {
      return Response.json({ error: "Profile not found" }, { status: 404 });
    }

    return Response.json(profile);
  } catch (error) {
    console.error("Get profile error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
