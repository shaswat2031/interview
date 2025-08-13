import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Plan from "@/models/Plan";
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

    const { planId, isBundle, maxInterviews } = await request.json();

    // Validate input
    if (!planId) {
      return Response.json({ error: "Plan ID is required" }, { status: 400 });
    }

    // Get the plan details
    const plan = await Plan.findOne({ id: planId });
    if (!plan) {
      return Response.json(
        { error: "Selected plan not found" },
        { status: 404 }
      );
    }

    const billingCycle = isBundle ? "one-time" : "monthly";

    // Get the user to check current interviews
    const existingUser = await User.findById(decoded.userId);
    if (!existingUser) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Check if this is a bundle purchase while user already has interviews
    let newInterviewsCount = maxInterviews;
    let wasUpgraded = false;

    if (isBundle && existingUser.interviewsLeft > 0) {
      // If user already has interviews and is buying a bundle, add to existing count
      newInterviewsCount = existingUser.interviewsLeft + maxInterviews;
      wasUpgraded = true;
    }

    // Update user's plan with correct number of interviews
    const user = await User.findByIdAndUpdate(
      decoded.userId,
      {
        plan: planId,
        billingCycle,
        interviewsLeft: newInterviewsCount,
        subscriptionStatus: "active",
        profileComplete: true,
      },
      { new: true }
    );

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({
      message: wasUpgraded
        ? `Plan selected successfully! Added ${maxInterviews} interviews to your existing ${existingUser.interviewsLeft} interviews.`
        : "Plan selected successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        plan: user.plan,
        billingCycle: user.billingCycle,
        subscriptionStatus: user.subscriptionStatus,
        profileComplete: user.profileComplete,
        interviewsLeft: user.interviewsLeft,
        wasUpgraded: wasUpgraded,
      },
    });
  } catch (error) {
    console.error("Plan selection error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
