import dbConnect from "../lib/mongodb.js";
import Plan from "../models/Plan.js";

const seedPlans = async () => {
  try {
    await dbConnect();

    // Clear existing plans
    await Plan.deleteMany({});

    const plans = [
      {
        id: "free",
        name: "Free Plan",
        description: "Get started with basic interview practice",
        monthlyPrice: 0,
        yearlyPrice: 0,
        features: [
          "1 interview per month",
          "Basic feedback reports",
          "Common interview questions",
          "Email support",
        ],
        popular: false,
        maxInterviews: 1,
        isActive: true,
      },
      {
        id: "bundle2",
        name: "Bundle of 2 Interviews",
        description: "Perfect for immediate interview preparation",
        monthlyPrice: 60,
        yearlyPrice: 60, // One-time payment
        features: [
          "2 practice interviews",
          "Basic feedback reports",
          "Common interview questions",
          "Email support",
          "Valid for 3 months",
        ],
        popular: false,
        maxInterviews: 2,
        isActive: true,
        isBundle: true,
      },
      {
        id: "bundle5",
        name: "Bundle of 5 Interviews",
        description: "Best value for regular interview practice",
        monthlyPrice: 150,
        yearlyPrice: 150, // One-time payment
        features: [
          "5 practice interviews",
          "Detailed feedback analysis",
          "Common interview questions",
          "Priority email support",
          "Valid for 6 months",
        ],
        popular: true,
        maxInterviews: 5,
        isActive: true,
        isBundle: true,
      },
      {
        id: "bundle8",
        name: "Bundle of 8 Interviews",
        description: "Comprehensive interview preparation package",
        monthlyPrice: 210,
        yearlyPrice: 210, // One-time payment
        features: [
          "8 practice interviews",
          "Unlimited practice interviews",
          "Advanced profile management",
          "Complete plan management",
          "Advanced feedback analysis",
          "Industry-specific questions",
          "Priority support",
          "Performance tracking",
        ],
        popular: true,
        maxInterviews: 8,
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
        maxInterviews: 8,
      },
    ];

    await Plan.insertMany(plans);
    console.log("Plans seeded successfully!");
  } catch (error) {
    console.error("Error seeding plans:", error);
  }
};

seedPlans();
