import dbConnect from "@/lib/mongodb";
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

    const { planId, billingCycle } = await request.json();

    // Validate input
    if (!planId || !billingCycle) {
      return Response.json(
        { error: "Plan ID and billing cycle are required" },
        { status: 400 }
      );
    }

    // Update user's plan
    const user = await User.findByIdAndUpdate(
      decoded.userId,
      {
        plan: planId,
        billingCycle,
        subscriptionStatus: "active",
        profileComplete: true,
      },
      { new: true }
    );

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({
      message: "Plan selected successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        plan: user.plan,
        billingCycle: user.billingCycle,
        subscriptionStatus: user.subscriptionStatus,
        profileComplete: user.profileComplete,
      },
    });
  } catch (error) {
    console.error("Plan selection error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
