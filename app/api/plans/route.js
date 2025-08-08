import dbConnect from "@/lib/mongodb";
import Plan from "@/models/Plan";

export async function GET() {
  try {
    await dbConnect();

    const plans = await Plan.find({ isActive: true }).sort({ monthlyPrice: 1 });

    return Response.json(plans);
  } catch (error) {
    console.error("Error fetching plans:", error);
    return Response.json({ error: "Failed to fetch plans" }, { status: 500 });
  }
}
