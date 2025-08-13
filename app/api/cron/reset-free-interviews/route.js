import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Plan from "@/models/Plan";

// This endpoint is for resetting interview counts for free plan users
export async function POST(request) {
  try {
    // Secure this endpoint with an API key
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json({ error: "No API key provided" }, { status: 401 });
    }

    const apiKey = authHeader.substring(7);
    if (apiKey !== process.env.CRON_API_KEY) {
      return Response.json({ error: "Invalid API key" }, { status: 401 });
    }

    await dbConnect();

    // Get all free plan users
    const freePlanUsers = await User.find({ plan: "free" });

    // Reset their interview count to 1
    const updatePromises = freePlanUsers.map((user) => {
      user.interviewsLeft = 1;
      return user.save();
    });

    await Promise.all(updatePromises);

    return Response.json({
      success: true,
      message: `Reset interviews for ${freePlanUsers.length} free plan users`,
      count: freePlanUsers.length,
    });
  } catch (error) {
    console.error("Error resetting interviews:", error);
    return Response.json(
      { success: false, error: "Failed to reset interviews" },
      { status: 500 }
    );
  }
}
