import mongoose from "mongoose";

const InterviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "Technical",
        "Behavioral",
        "System Design",
        "Coding",
        "Leadership",
        "Product Management",
      ],
    },
    company: {
      type: String,
      required: true,
    },
    jobTitle: {
      type: String,
    },
    focus: [String], // Focus areas for the interview
    customRequirements: String,
    industry: {
      type: String,
      enum: [
        "Technology",
        "Finance",
        "Healthcare",
        "Marketing",
        "Sales",
        "Other",
      ],
      default: "Technology",
    },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Intermediate",
    },
    duration: {
      type: Number, // in minutes
      default: 30,
    },
    score: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    feedback: {
      strengths: [String],
      weaknesses: [String],
      recommendations: [String],
      overallFeedback: String,
      aiScore: Number, // Overall AI-generated score
      detailedAnalysis: String, // Detailed AI analysis
    },
    timeSpent: Number, // Time spent in seconds
    answers: mongoose.Schema.Types.Mixed, // Store all answers as key-value pairs
    questions: [
      {
        question: String,
        category: String,
        context: String,
        difficulty: String,
        estimatedTime: Number,
        order: Number,
        answer: String,
        score: Number,
        feedback: String,
        voiceRecording: String, // URL to voice recording
        aiAnalysis: String, // AI analysis of the answer
      },
    ],
    status: {
      type: String,
      enum: ["scheduled", "in-progress", "completed", "cancelled"],
      default: "scheduled",
    },
    completedAt: Date,
    scheduledFor: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
InterviewSchema.index({ userId: 1, createdAt: -1 });
InterviewSchema.index({ userId: 1, status: 1 });

// Clear any existing model to avoid conflicts
if (mongoose.models.Interview) {
  delete mongoose.models.Interview;
}

export default mongoose.model("Interview", InterviewSchema);
