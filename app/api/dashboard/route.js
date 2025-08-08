import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Interview from "@/models/Interview";
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
      status: "completed",
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
      totalInterviews,
      averageScore: Math.round(averageScore * 10) / 10,
      totalPracticeHours: Math.round(totalPracticeHours * 10) / 10,
      skillsImproved: Math.min(Math.floor(totalInterviews / 2), 10), // Simple calculation
    };

    // Format userStats for dashboard
    const userStats = {
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
      plan: user.plan || "",
      planPrice: "", // You can add pricing logic here later
      avatar: "👨‍💼",
      interviewsUsed: totalInterviews,
      interviewsTotal:
        user.plan === "free" ? 1 : user.plan === "starter" ? 5 : -1, // -1 for unlimited (weekly/monthly)
      averageScore: stats.averageScore,
      practiceHours: stats.totalPracticeHours,
      skillsImproved: stats.skillsImproved,
      trialActive: user.subscriptionStatus === "trial",
      trialDaysLeft: user.trialEndsAt
        ? Math.max(
            0,
            Math.ceil(
              (new Date(user.trialEndsAt) - new Date()) / (1000 * 60 * 60 * 24)
            )
          )
        : 0,
      nextBillingDate: "", // You can add billing logic here later
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
