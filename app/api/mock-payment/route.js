import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";

// This endpoint bypasses Stripe and directly processes a "mock payment" for testing
export async function POST(request) {
  console.log("Mock payment endpoint called");

  try {
    // Connect to the database
    await dbConnect();

    // Get token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("No token provided");
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    console.log("User ID from token:", userId);

    // Get request data
    const requestData = await request.json();
    const {
      planId,
      isRenewal = false,
      customAmount,
      metadata = {},
    } = requestData;

    console.log("Mock payment request data:", requestData);

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      console.error(`User not found: ${userId}`);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Extract interview count from metadata
    const interviewCount = parseInt(metadata.interviewCount || "0", 10);

    if (interviewCount <= 0) {
      return NextResponse.json(
        { error: "Invalid interview count" },
        { status: 400 }
      );
    }

    // Process the mock payment by updating the user directly
    if (isRenewal) {
      // For renewal, add to existing interview count
      user.interviewsLeft = Math.max(0, user.interviewsLeft) + interviewCount;
    } else if (metadata.isBundle === "true") {
      // For bundle purchase, add to existing count
      user.interviewsLeft += interviewCount;
      user.plan = planId;
    } else {
      // For new plan purchase, replace count
      user.interviewsLeft = interviewCount;
      user.plan = planId;
    }

    await user.save();
    console.log(`Mock payment successful for user ${userId}`);
    console.log(
      `Added ${interviewCount} interviews. New total: ${user.interviewsLeft}`
    );

    // Return success response with mock session ID and success URL
    return NextResponse.json({
      success: true,
      sessionId: `mock_session_${Date.now()}`,
      url: `${
        process.env.NEXT_PUBLIC_APP_URL
      }/payment-success?session_id=mock_session_${Date.now()}`,
      paymentDetails: {
        amount: customAmount,
        interviewsAdded: interviewCount,
        newTotal: user.interviewsLeft,
        planName: metadata.planName || "Custom Plan",
      },
    });
  } catch (error) {
    console.error("Error processing mock payment:", error);
    return NextResponse.json(
      { error: "Failed to process mock payment", details: error.message },
      { status: 500 }
    );
  }
}
