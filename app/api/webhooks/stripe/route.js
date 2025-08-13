import { NextResponse } from "next/server";
import { stripe } from "@/app/lib/stripe-helpers";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Plan from "@/models/Plan";

// This is your Stripe webhook handler for asynchronous events.
// See https://stripe.com/docs/webhooks for more details
export async function POST(request) {
  console.log("Webhook event received!");
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event;
  try {
    // For testing with the Stripe CLI, use the webhook signing secret from Stripe CLI
    const webhookSecret =
      process.env.STRIPE_WEBHOOK_SECRET ||
      process.env.STRIPE_CLI_WEBHOOK_SECRET;

    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

    console.log(`✅ Webhook verified: ${event.type}`);
  } catch (err) {
    console.error(`⚠️ Webhook signature verification failed.`, err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle the event
  try {
    console.log(`Processing event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        console.log("Checkout session completed:", event.data.object.id);
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      }
      case "payment_intent.succeeded": {
        console.log("Payment intent succeeded:", event.data.object.id);
        // For payment_intent.succeeded, we can log the details
        const paymentIntent = event.data.object;
        console.log(
          `Amount: ${paymentIntent.amount / 100} ${paymentIntent.currency}`
        );
        console.log(`Customer: ${paymentIntent.customer || "N/A"}`);
        console.log(
          `Payment method: ${paymentIntent.payment_method_types.join(", ")}`
        );

        // If we have userId in metadata, we can log that too
        if (paymentIntent.metadata?.userId) {
          console.log(`User ID: ${paymentIntent.metadata.userId}`);
        }
        break;
      }
      case "payment_intent.payment_failed": {
        console.log("Payment intent failed:", event.data.object.id);
        const paymentIntent = event.data.object;
        const error = paymentIntent.last_payment_error;

        console.log(`Payment failed: ${error?.message || "Unknown error"}`);
        console.log(`Customer: ${paymentIntent.customer || "N/A"}`);

        // We could notify the user or admin about the failed payment here
        break;
      }
      default: {
        console.log(`Received event: ${event.type}`);
      }
    }

    console.log("Webhook processed successfully");
    return NextResponse.json({ received: true, status: "success" });
  } catch (error) {
    console.error(`Error handling webhook event: ${error.message}`);
    return NextResponse.json(
      { error: "Webhook handler failed", details: error.message },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session) {
  console.log("Processing checkout session:", session.id);

  // Connect to database
  await dbConnect();

  // Extract metadata
  const { userId, planId, isRenewal, interviewCount } = session.metadata || {};

  console.log("Session metadata:", {
    userId,
    planId,
    isRenewal,
    interviewCount,
    paymentStatus: session.payment_status,
    amountTotal: session.amount_total,
  });

  if (!userId) {
    console.error("No userId found in session metadata");
    return;
  }

  // Get user
  const user = await User.findById(userId);
  if (!user) {
    console.error(`User not found: ${userId}`);
    return;
  }

  console.log(`User found: ${user.email} (${userId})`);
  console.log(
    `Current interviews left: ${user.interviewsLeft}, Current plan: ${user.plan}`
  );

  // Get plan details if applicable
  let plan = null;
  if (planId && planId !== "custom") {
    plan = await Plan.findOne({ id: planId });
    if (plan) {
      console.log(
        `Plan found: ${plan.name} (${planId}), maxInterviews: ${plan.maxInterviews}`
      );
    } else {
      console.log(`Plan not found: ${planId}`);
    }
  }

  // Process the successful payment
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
  console.log(`✅ User ${userId} updated successfully!`);
  console.log(
    `Added ${interviews} interviews. New total: ${user.interviewsLeft}`
  );
  if (planId !== "custom") {
    console.log(
      `Plan updated to: ${user.plan}, Billing cycle: ${user.billingCycle}`
    );
  }
  console.log(`Checkout session ${session.id} processing completed`);
}
