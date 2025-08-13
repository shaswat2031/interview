import dbConnect from "@/lib/mongodb";
import Plan from "@/models/Plan";

export async function GET() {
  try {
    await dbConnect();

    const plans = await Plan.find({ isActive: true }).sort({ monthlyPrice: 1 });

    // Format plans for frontend consumption
    const formattedPlans = plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price: plan.monthlyPrice,
      features: plan.features || [],
      popular: plan.popular || false,
      maxInterviews: plan.maxInterviews,
      isBundle: plan.isBundle || false,
      validityMonths: plan.validityMonths || 1,
    }));

    return Response.json({
      success: true,
      plans: formattedPlans,
    });
  } catch (error) {
    console.error("Error fetching plans:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to fetch plans",
        plans: [],
      },
      { status: 500 }
    );
  }
}
