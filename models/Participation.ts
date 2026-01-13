import mongoose, { Schema, models, model } from "mongoose";

export interface IParticipation extends mongoose.Document {
  eventId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ParticipationSchema = new Schema<IParticipation>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// un user nu poate participa de 2 ori la același event
ParticipationSchema.index({ eventId: 1, userId: 1 }, { unique: true });

export default models.Participation ||
  model<IParticipation>("Participation", ParticipationSchema);
