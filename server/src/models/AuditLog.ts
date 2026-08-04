import mongoose, { Schema, Document, Types } from 'mongoose';

export type AuditStatus = 'SUCCESS' | 'FAILURE' | 'INFO';

export interface IAuditLog extends Document {
  user?: Types.ObjectId;
  action: string;
  status: AuditStatus;
  message?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const AuditLogSchema: Schema<IAuditLog> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    action: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILURE', 'INFO'],
      required: true,
    },
    message: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
