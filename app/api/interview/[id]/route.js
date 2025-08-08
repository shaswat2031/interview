import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Interview from "../../../../models/Interview";
import dbConnect from "../../../lib/mongodb";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // Get token from header
    const authorization = request.headers.get("authorization");
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authorization.split(" ")[1];

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await dbConnect();

    // Find interview and verify ownership
    const interview = await Interview.findById(id);
    if (!interview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    if (interview.userId.toString() !== decoded.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(interview);
  } catch (error) {
    console.error("Get interview error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch interview",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
