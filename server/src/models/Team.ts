import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITeam extends Document {
  name: string;
  station?: Types.ObjectId;
  leader?: Types.ObjectId;
  members: Types.ObjectId[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema: Schema<ITeam> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
      unique: true,
    },
    station: {
      type: Schema.Types.ObjectId,
      ref: 'Station',
    },
    leader: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    members: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: [],
    }],
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Team = mongoose.model<ITeam>('Team', TeamSchema);
