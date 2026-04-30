import mongoose from "mongoose";

const NominalRollSchema = new mongoose.Schema(
  {
    awsLinkId: {
      type: String,
      required: [true, "AWS link ID is required"],
      trim: true,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  }
);

export default mongoose.models.NominalRoll ||
  mongoose.model("NominalRoll", NominalRollSchema);
