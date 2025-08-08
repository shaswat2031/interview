import dbConnect from "../lib/mongodb";
import Plan from "../models/Plan.js";

const seedPlans = async () => {
  try {
    await dbConnect();

    // Clear existing plans
    await Plan.deleteMany({});

    const plans = [
      {
        id: "free",
        name: "Free",
        description: "Get started with basic interview practice",
        monthlyPrice: 0,
        yearlyPrice: 0,
        features: [
          "1 practice interview per month",
          "Basic feedback reports",
          "Common interview questions",
          "Email support",
        ],
        popular: false,
        maxInterviews: 1,
      },
      {
        id: "starter",
        name: "Starter",
        description: "Perfect for regular interview practice",
        monthlyPrice: 99,
        yearlyPrice: 990,
        features: [
          "5 practice interviews per month",
          "Profile management",
          "Plan management dashboard",
          "Basic feedback analysis",
          "Common interview questions",
          "Email support",
        ],
        popular: false,
        maxInterviews: 5,
      },
      {
        id: "weekly",
        name: "Weekly",
        description: "Most popular choice for serious job seekers",
        monthlyPrice: 199,
        yearlyPrice: 1990,
        features: [
          "Unlimited practice interviews",
          "Advanced profile management",
          "Complete plan management",
          "Advanced feedback analysis",
          "Industry-specific questions",
          "Priority support",
          "Performance tracking",
        ],
        popular: true,
        maxInterviews: -1,
      },
      {
        id: "monthly",
        name: "Monthly",
        description: "Best value for comprehensive interview preparation",
        monthlyPrice: 599,
        yearlyPrice: 5990,
        features: [
          "Everything in Weekly",
          "Premium profile management",
          "Advanced plan management",
          "Custom interview scenarios",
          "Team collaboration tools",
          "API access",
          "Dedicated account manager",
        ],
        popular: false,
        maxInterviews: -1,
      },
    ];

    await Plan.insertMany(plans);
    console.log("Plans seeded successfully!");
  } catch (error) {
    console.error("Error seeding plans:", error);
  }
};

seedPlans();
