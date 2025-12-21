import mongoose, { Schema, models, model } from "mongoose";

export type UserRole = "organizer" | "attendee";

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["organizer", "attendee"],
      default: "attendee",
    },
  },
  { timestamps: true }
);

export default models.User || model<IUser>("User", UserSchema);
