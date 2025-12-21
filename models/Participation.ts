import mongoose, { Schema, models, model } from "mongoose";

export interface IEvent extends mongoose.Document {
  title: string;
  description: string;
  date: Date;
  location: string;
  category: string;
  organizerId: mongoose.Types.ObjectId;
  isCanceled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MAX_DESCRIPTION_LENGTH = 800;

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: MAX_DESCRIPTION_LENGTH,
    },
    date: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    category: {
      type: String,
      default: "General",
      trim: true,
      maxlength: 50,
    },
    organizerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isCanceled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// index-uri utile pentru search & filters
EventSchema.index({ title: "text", location: "text" });
EventSchema.index({ date: 1 });
EventSchema.index({ category: 1 });

export const EVENT_LIMITS = {
  MAX_DESCRIPTION_LENGTH,
};

export default models.Event || model<IEvent>("Event", EventSchema);
