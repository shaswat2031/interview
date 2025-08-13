import { NextResponse } from "next/server";
import { stripe } from "@/app/lib/stripe-helpers";
import dbConnect from "@/lib/mongodb";
import Plan from "@/models/Plan";
import jwt from "jsonwebtoken";

export async function POST(request) {
  console.log("Checkout session endpoint called");
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

    console.log("Request data:", requestData);

    // If customAmount is provided, use it (for custom renewals)
    // Otherwise, fetch the plan details
    let planDetails = null;
    let amount = 0;
    let planName = "";

    if (customAmount) {
      amount = customAmount;
      planName = metadata.planName || "Custom Payment";
    } else {
      // Find the plan in the database
      planDetails = await Plan.findOne({ id: planId });
      if (!planDetails) {
        return NextResponse.json({ error: "Plan not found" }, { status: 404 });
      }

      // Set amount based on plan price
      amount = planDetails.monthlyPrice || planDetails.price || 0;
      planName = planDetails.name;
    }

    // Return error if amount is zero
    if (amount <= 0) {
      console.error("Invalid payment amount:", amount);
      return NextResponse.json(
        { error: "Invalid payment amount" },
        { status: 400 }
      );
    }

    // Merge provided metadata with essential data
    const sessionMetadata = {
      userId,
      planId: planId || "custom",
      isRenewal: isRenewal.toString(),
      ...metadata,
    };

    console.log("Creating Stripe checkout session with:", {
      amount,
      planName,
      metadata: sessionMetadata,
    });

    try {
      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "inr",
              product_data: {
                name: planName,
                description: isRenewal ? "Plan Renewal" : "Plan Purchase",
              },
              unit_amount: Math.round(amount * 100), // Convert to paise
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/interview-setup`,
        metadata: sessionMetadata,
      });

      console.log("Checkout session created:", session.id);
      console.log("Checkout URL:", session.url);

      return NextResponse.json({
        sessionId: session.id,
        url: session.url,
      });
    } catch (stripeError) {
      console.error("Stripe error:", stripeError);
      return NextResponse.json(
        { error: "Stripe error", details: stripeError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session", details: error.message },
      { status: 500 }
    );
  }
}
