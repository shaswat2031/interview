import { NextResponse } from "next/server";
import { stripe } from "@/app/lib/stripe-helpers";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Plan from "@/models/Plan";
import jwt from "jsonwebtoken";

export async function GET(request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Get session ID from URL
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    // Verify payment was successful
    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed", status: session.payment_status },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Extract metadata
    const { planId, isRenewal, interviewCount } = session.metadata || {};

    // Verify this session belongs to the authenticated user
    if (session.metadata.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized access to payment session" },
        { status: 403 }
      );
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get plan details if applicable
    let plan = null;
    if (planId && planId !== "custom") {
      plan = await Plan.findOne({ id: planId });
    }

    // Process the successful payment
    // Logic depends on whether this is a renewal or new plan purchase
    let interviews = 0;
    if (plan) {
      interviews = plan.maxInterviews || 0;
    } else if (interviewCount) {
      interviews = parseInt(interviewCount, 10) || 0;
    }

    // Update the user based on purchase type
    const isRenewalBool = isRenewal === "true";
    if (isRenewalBool) {
      // For renewal, add to existing interview count
      user.interviewsLeft = Math.max(0, user.interviewsLeft) + interviews;
    } else if (planId !== "custom") {
      // For new plan purchase
      const billingCycle = plan.isBundle ? "one-time" : "monthly";

      // If it's a bundle, add to existing interviews
      if (plan.isBundle && user.interviewsLeft > 0) {
        user.interviewsLeft += interviews;
      } else {
        user.interviewsLeft = interviews;
      }

      user.plan = planId;
      user.billingCycle = billingCycle;
      user.subscriptionStatus = "active";
    } else {
      // For custom payment, just add the interviews
      user.interviewsLeft = Math.max(0, user.interviewsLeft) + interviews;
    }

    await user.save();

    return NextResponse.json({
      success: true,
      interviewsLeft: user.interviewsLeft,
      plan: user.plan,
      paymentId: session.payment_intent.id,
      amount: session.amount_total / 100, // Convert from paise to rupees
      planName: plan ? plan.name : "Custom Purchase",
      interviews: interviews,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Failed to verify payment", details: error.message },
      { status: 500 }
    );
  }
}
