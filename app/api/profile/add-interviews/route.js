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

    const { quantity = 1 } = await request.json();

    // Validate input
    if (quantity <= 0 || quantity > 10) {
      return Response.json(
        { error: "Invalid quantity. Must be between 1 and 10." },
        { status: 400 }
      );
    }

    // Get user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Add additional interviews to the user's account
    user.interviewsLeft += quantity;
    await user.save();

    return Response.json({
      success: true,
      message: `Added ${quantity} additional interviews`,
      interviewsLeft: user.interviewsLeft,
    });
  } catch (error) {
    console.error("Error adding interviews:", error);
    return Response.json(
      { success: false, error: "Failed to add interviews" },
      { status: 500 }
    );
  }
}
