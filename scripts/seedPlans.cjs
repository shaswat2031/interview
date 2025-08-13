const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

// MongoDB connection URI
const MONGODB_URI =
  process.env.mongodb_uri ||
  "mongodb+srv://prasadshaswat9265:prasadshaswat9265@cluster0.atgekgj.mongodb.net/interviewai?retryWrites=true&w=majority";

// Define Plan schema
const planSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    monthlyPrice: {
      type: Number,
      required: true,
    },
    yearlyPrice: {
      type: Number,
      required: true,
    },
    features: [String],
    popular: {
      type: Boolean,
      default: false,
    },
    maxInterviews: {
      type: Number,
      default: 8, // Default bundle size is 8 interviews
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    isBundle: {
      type: Boolean,
      default: false,
    },
    validityMonths: {
      type: Number,
      default: 1, // Default validity period in months
    },
  },
  {
    timestamps: true,
  }
);

// Use existing model or create new one
const Plan = mongoose.models.Plan || mongoose.model("Plan", planSchema);

const seedPlans = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing plans
    await Plan.deleteMany({});
    console.log("Cleared existing plans");

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
        validityMonths: 3,
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
        validityMonths: 6,
      },
      {
        id: "bundle8",
        name: "Bundle of 8 Interviews",
        description: "Comprehensive interview preparation package",
        monthlyPrice: 210,
        yearlyPrice: 210, // One-time payment
        features: [
          "8 practice interviews",
          "Comprehensive feedback analysis",
          "Custom interview questions",
          "Advanced analytics",
          "Priority email support",
          "Valid for 12 months",
        ],
        popular: false,
        maxInterviews: 8,
        isActive: true,
        isBundle: true,
        validityMonths: 12,
      },
    ];

    await Plan.insertMany(plans);
    console.log("Plans seeded successfully!");

    // Close DB connection
    await mongoose.connection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error seeding plans:", error);
    process.exit(1);
  }
};

seedPlans();
