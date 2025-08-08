import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    jobProfile: {
      type: String,
      required: [true, "Job profile is required"],
      trim: true,
    },
    experience: {
      level: {
        type: String,
        enum: [
          "Entry Level (0-2 years)",
          "Mid Level (2-5 years)",
          "Senior Level (5-8 years)",
          "Lead/Principal (8+ years)",
        ],
        required: true,
      },
      years: {
        type: Number,
        required: true,
        min: 0,
        max: 50,
      },
      description: String,
    },
    techStack: {
      primary: [String], // Main technologies
      secondary: [String], // Additional technologies
      frameworks: [String],
      databases: [String],
      tools: [String],
    },
    jobRole: {
      current: String,
      target: {
        type: String,
        required: [true, "Target job role is required"],
      },
      industry: {
        type: String,
        enum: [
          "Technology",
          "Finance",
          "Healthcare",
          "E-commerce",
          "Consulting",
          "Startup",
          "Enterprise",
          "Other",
        ],
        required: true,
      },
      companySize: {
        type: String,
        enum: [
          "Startup (1-50)",
          "Small (51-200)",
          "Medium (201-1000)",
          "Large (1000+)",
        ],
      },
    },
    preferences: {
      interviewTypes: [
        {
          type: String,
          enum: [
            "Technical",
            "Behavioral",
            "System Design",
            "Coding",
            "Leadership",
            "Product Management",
          ],
        },
      ],
      difficulty: {
        type: String,
        enum: ["Beginner", "Intermediate", "Advanced"],
        default: "Intermediate",
      },
      duration: {
        type: Number, // in minutes
        default: 30,
      },
    },
    completedInterviews: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    strengths: [String],
    weaknesses: [String],
    goals: [String],
    isComplete: {
      type: Boolean,
      default: false,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Update lastUpdated on save
ProfileSchema.pre("save", function (next) {
  this.lastUpdated = new Date();
  next();
});

// Check if profile is complete
ProfileSchema.methods.checkCompletion = function () {
  this.isComplete = !!(
    this.fullName &&
    this.jobProfile &&
    this.experience.level &&
    this.experience.years !== undefined &&
    this.techStack.primary.length > 0 &&
    this.jobRole.target &&
    this.jobRole.industry
  );
  return this.isComplete;
};

export default mongoose.models.Profile ||
  mongoose.model("Profile", ProfileSchema);
