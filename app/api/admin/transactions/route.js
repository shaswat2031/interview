import { NextResponse } from "next/server";
import { stripe } from "@/app/lib/stripe-helpers";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function GET(request) {
  try {
    // Check if Stripe is properly configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        {
          error:
            "Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.",
        },
        { status: 500 }
      );
    }

    // Get token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Connect to database
    await dbConnect();

    // Check if user is admin
    const user = await User.findById(userId);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    // Get transactions from Stripe
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 100, // Adjust as needed
    });

    // Get user emails for the transactions
    const userIds = paymentIntents.data
      .map((intent) => intent.metadata?.userId)
      .filter(Boolean);

    const users = await User.find({ _id: { $in: userIds } });
    const userMap = {};
    users.forEach((user) => {
      userMap[user._id.toString()] = {
        email: user.email,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      };
    });

    // Format transactions
    const transactions = paymentIntents.data.map((intent) => {
      const userId = intent.metadata?.userId;
      return {
        id: intent.id,
        amount: intent.amount,
        status: intent.status,
        created: new Date(intent.created * 1000).toISOString(),
        planName: intent.metadata?.planName || "Unknown Plan",
        userEmail: userId ? userMap[userId]?.email : "Unknown",
        userName: userId ? userMap[userId]?.name : "Unknown",
      };
    });

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
