// models/Sheet.js
import mongoose from "mongoose";

const SheetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Sheet name is required"],
      trim: true,
    },
    driverName: {
      type: String,
      trim: true,
      default: "",
    },
    vehicleType: {
      type: String,
      trim: true,
      default: "",
    },
    busNumber: {
      type: String,
      trim: true,
      default: "",
    },
    jathedarName: {
      type: String,
      trim: true,
      default: "",
    },
    jathedarMobileNumber: {
      type: String,
      trim: true,
      default: "",
    },
    sewaDuration: {
      type: String,
      trim: true,
      default: "",
    },
    sewaName: {
      type: String,
      trim: true,
      default: "",
    },
    nominalRollId: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true, // createdAt, updatedAt auto-managed
  }
);

const existingSheetModel = mongoose.models.Sheet;

if (existingSheetModel) {
  existingSheetModel.schema.add(SheetSchema.obj);
}

export default existingSheetModel || mongoose.model("Sheet", SheetSchema);
