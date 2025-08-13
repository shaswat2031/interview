import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Interview from "@/models/Interview";
import Plan from "@/models/Plan";
import jwt from "jsonwebtoken";

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

    // Get user data
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's interviews
    const interviews = await Interview.find({ userId: decoded.userId })
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate stats
    const totalInterviews = await Interview.countDocuments({
      userId: decoded.userId,
    });

    const completedInterviews = await Interview.find({
      userId: decoded.userId,
      status: "completed",
      score: { $exists: true },
    });

    const averageScore =
      completedInterviews.length > 0
        ? completedInterviews.reduce(
            (sum, interview) => sum + interview.score,
            0
          ) / completedInterviews.length
        : 0;

    const totalPracticeHours =
      completedInterviews.reduce(
        (sum, interview) => sum + (interview.duration || 0),
        0
      ) / 60;

    // Get upcoming interviews
    const upcomingInterviews = await Interview.find({
      userId: decoded.userId,
      status: "scheduled",
      scheduledFor: { $gte: new Date() },
    })
      .sort({ scheduledFor: 1 })
      .limit(5);

    const stats = {
      totalInterviews: completedInterviews.length, // Keep this as completed for display
      averageScore: Math.round(averageScore * 10) / 10,
      totalPracticeHours: Math.round(totalPracticeHours * 10) / 10,
      skillsImproved: Math.min(Math.floor(completedInterviews.length / 2), 10), // Simple calculation
    };

    // Format userStats for dashboard
    // Get plan details
    const plan = await Plan.findOne({ id: user.plan });

    const userStats = {
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
      plan: plan ? plan.name : "Free Plan",
      planPrice: plan ? `₹${plan.monthlyPrice}` : "₹0",
      avatar: "👨‍💼",
      interviewsUsed: totalInterviews, // Count all interviews for plan limits
      interviewsLeft: user.interviewsLeft,
      interviewsTotal: plan ? plan.maxInterviews : 1,
      averageScore: stats.averageScore,
      practiceHours: stats.totalPracticeHours,
      skillsImproved: stats.skillsImproved,
      isBundle: plan ? plan.isBundle : false,
      validityMonths: plan && plan.isBundle ? plan.validityMonths : 1,
      nextBillingDate:
        user.plan === "free"
          ? new Date(
              new Date().setMonth(new Date().getMonth() + 1)
            ).toLocaleDateString()
          : "",
      memberSince: user.createdAt
        ? new Date(user.createdAt).toLocaleDateString()
        : "",
    };

    return Response.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        plan: user.plan,
        subscriptionStatus: user.subscriptionStatus,
        trialEndsAt: user.trialEndsAt,
      },
      userStats,
      stats,
      recentInterviews: interviews.slice(0, 3),
      upcomingInterviews,
    });
  } catch (error) {
    console.error("Dashboard data error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
