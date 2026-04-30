// models/Person.js
import mongoose from "mongoose";

const PersonSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    fatherOrHusbandName: {
      type: String,
      required: [true, "Father/Husband name is required"],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [1, "Age must be at least 1"],
      max: [120, "Age must be realistic"],
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: ["Male", "Female", "Other"],
    },
    mobileNumber: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    aadharNumber: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

// Text index for fast name search
PersonSchema.index({ name: "text" });
// Regular index for partial/prefix search
PersonSchema.index({ name: 1 });

export default mongoose.models.Person || mongoose.model("Person", PersonSchema);
