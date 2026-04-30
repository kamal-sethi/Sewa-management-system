// models/Record.js
import mongoose from "mongoose";

const RecordSchema = new mongoose.Schema(
  {
    sheetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sheet",
      required: [true, "Sheet ID is required"],
    },
    personId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Person",
      required: [true, "Person ID is required"],
    },
    fare: {
      type: String,
      trim: true,
      default: "",
    },
    remarks: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Keep this indexed for lookup speed, but allow duplicates when needed.
RecordSchema.index({ sheetId: 1, personId: 1 });

export default mongoose.models.Record ||
  mongoose.model("Record", RecordSchema);
