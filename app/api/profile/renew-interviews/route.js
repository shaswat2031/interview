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

    // Get request body for payment details and renewal options
    const {
      paymentMethod,
      useDiscount = false,
      newPlanId = null,
    } = await request.json();

    // Get user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Determine which plan to use - current plan or new plan if changing
    let plan;
    let isChangingPlan = false;

    if (newPlanId) {
      // User is changing to a new plan
      plan = await Plan.findOne({ id: newPlanId });
      if (!plan) {
        return Response.json({ error: "New plan not found" }, { status: 404 });
      }
      isChangingPlan = true;
    } else {
      // User is renewing current plan
      plan = await Plan.findOne({ id: user.plan });
      if (!plan) {
        return Response.json(
          { error: "Current plan not found" },
          { status: 404 }
        );
      }
    }

    // Calculate renewal price based on plan
    let renewalPrice = 0;
    let renewalInterviews = plan.maxInterviews;

    // Apply discount if eligible and requested
    // Users with some interviews left can still renew at a discount
    const hasInterviewsLeft = user.interviewsLeft > 0;
    const discountPercentage = hasInterviewsLeft ? 15 : 0; // 15% discount for early renewal

    // Calculate pricing based on plan type
    if (plan.isBundle) {
      // For bundle plans, price is a percentage of the original price
      renewalPrice = Math.round(plan.monthlyPrice * 0.8); // 20% off original price for renewal

      if (useDiscount && hasInterviewsLeft) {
        renewalPrice = Math.round(
          renewalPrice * (1 - discountPercentage / 100)
        );
      }
    } else if (plan.id === "free") {
      // For free plan, renewal costs a small fee
      renewalPrice = 30; // Fixed price for free plan renewals
      renewalInterviews = 1; // Free plan only gets 1 interview
    } else {
      // For subscription plans, use the monthly price
      renewalPrice = plan.monthlyPrice;

      if (useDiscount && hasInterviewsLeft) {
        renewalPrice = Math.round(
          renewalPrice * (1 - discountPercentage / 100)
        );
      }
    }

    // Process payment (in a real implementation, integrate with payment gateway)
    // This is a mock implementation
    const paymentSuccessful = true; // Simulate successful payment

    if (!paymentSuccessful) {
      return Response.json(
        {
          success: false,
          error: "Payment failed. Please try again.",
        },
        { status: 400 }
      );
    }

    // Update user's plan and interviews count
    if (isChangingPlan) {
      // If changing plans, update plan and billing cycle
      const billingCycle = plan.isBundle ? "one-time" : "monthly";

      // Add new interviews to existing count if it's a bundle
      const newInterviewsCount = plan.isBundle
        ? Math.max(user.interviewsLeft, 0) + renewalInterviews
        : renewalInterviews;

      user.plan = plan.id;
      user.billingCycle = billingCycle;
      user.interviewsLeft = newInterviewsCount;
    } else {
      // Just add new interviews to existing count
      user.interviewsLeft =
        Math.max(user.interviewsLeft, 0) + renewalInterviews;
    }

    await user.save();

    // Record the transaction
    // In a real implementation, you would store transaction details in a database

    return Response.json({
      success: true,
      message: isChangingPlan
        ? `Successfully changed to ${plan.name} with ${user.interviewsLeft} interviews`
        : `Successfully renewed ${renewalInterviews} interviews`,
      interviewsLeft: user.interviewsLeft,
      plan: user.plan,
      price: renewalPrice,
      currency: "INR",
      discountApplied:
        useDiscount && hasInterviewsLeft ? discountPercentage : 0,
      planChanged: isChangingPlan,
    });
  } catch (error) {
    console.error("Error renewing interviews:", error);
    return Response.json(
      { success: false, error: "Failed to renew interviews" },
      { status: 500 }
    );
  }
}
