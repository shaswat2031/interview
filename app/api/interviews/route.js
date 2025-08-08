import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Interview from "../../../models/Interview";
import dbConnect from "../../lib/mongodb";

export async function GET(request) {
  try {
    await dbConnect();

    // Get token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    // Build filter
    const filter = { userId: decoded.userId };
    if (status) filter.status = status;
    if (type) filter.type = type;

    // Get interviews with pagination
    const skip = (page - 1) * limit;
    const interviews = await Interview.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-answers -feedback"); // Exclude detailed data for listing

    // Get total count for pagination
    const totalCount = await Interview.countDocuments(filter);

    return NextResponse.json({
      interviews,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Get interviews error:", error);
    return NextResponse.json(
      { error: "Failed to fetch interviews" },
      { status: 500 }
    );
  }
}
