import { connectToDatabase } from "../../../lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { db } = await connectToDatabase();
    const profileData = await request.json();

    // Add timestamp
    profileData.updatedAt = new Date();
    profileData.createdAt = profileData.createdAt || new Date();

    // Upsert the profile (update if exists, create if doesn't)
    const result = await db.collection("profiles").updateOne(
      { email: profileData.email },
      {
        $set: profileData,
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: "Profile saved successfully",
      result,
    });
  } catch (error) {
    console.error("Error saving profile:", error);
    return NextResponse.json(
      { success: false, message: "Error saving profile" },
      { status: 500 }
    );
  }
}
