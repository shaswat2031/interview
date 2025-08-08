import dbConnect from "@/lib/mongodb";
import Plan from "@/models/Plan";

export async function GET() {
  try {
    await dbConnect();

    const plans = await Plan.find({ isActive: true }).sort({ monthlyPrice: 1 });

    // Format plans for frontend consumption
    const formattedPlans = plans.map((plan) => ({
      name: plan.name,
      price: plan.monthlyPrice === 0 ? "Free" : `$${plan.monthlyPrice}`,
      period: plan.monthlyPrice === 0 ? "" : "per month",
      interviews:
        plan.maxInterviews === -1
          ? "Unlimited interviews"
          : `${plan.maxInterviews} interviews`,
      features: plan.features || [],
      popular: plan.popular || false,
      monthlyPrice: plan.monthlyPrice,
      yearlyPrice: plan.yearlyPrice,
      maxInterviews: plan.maxInterviews,
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
