import mongoose from "mongoose";

const PlanSchema = new mongoose.Schema(
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
      default: -1, // -1 means unlimited
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Plan || mongoose.model("Plan", PlanSchema);
