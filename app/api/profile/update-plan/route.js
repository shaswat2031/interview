import { connectToDatabase } from "../../../../lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { db } = await connectToDatabase();
    const { plan, email } = await request.json();

    // Update the user's plan
    const result = await db.collection("profiles").updateOne(
      { email: email },
      {
        $set: {
          plan: plan,
          planUpdatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Log plan change
    await db.collection("plan_changes").insertOne({
      email: email,
      newPlan: plan,
      changedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Plan updated successfully",
    });
  } catch (error) {
    console.error("Error updating plan:", error);
    return NextResponse.json(
      { success: false, message: "Error updating plan" },
      { status: 500 }
    );
  }
}
