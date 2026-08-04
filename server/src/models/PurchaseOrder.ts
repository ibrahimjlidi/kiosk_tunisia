import mongoose, { Schema, Document } from 'mongoose';

export type PurchaseOrderStatus = 'PENDING' | 'DELIVERED' | 'CANCELLED';

export interface IPurchaseItem {
  product: mongoose.Types.ObjectId;
  quantity: number;       // Liters
  unitPrice: number;      // TND per liter (HT)
  totalPrice: number;     // quantity * unitPrice
  tank?: mongoose.Types.ObjectId;  // Target tank for delivery
}

export interface IPurchaseOrder extends Document {
  supplier: mongoose.Types.ObjectId;
  station: mongoose.Types.ObjectId;
  orderNumber: string;
  orderDate: Date;
  deliveryDate?: Date;
  status: PurchaseOrderStatus;
  items: IPurchaseItem[];
  totalAmount: number;
  notes: string;
  createdBy: mongoose.Types.ObjectId;
  deliveredBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseItemSchema: Schema<IPurchaseItem> = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1 liter'],
  },
  unitPrice: {
    type: Number,
    required: true,
    min: [0, 'Unit price cannot be negative'],
  },
  totalPrice: {
    type: Number,
    default: 0,
  },
  tank: {
    type: Schema.Types.ObjectId,
    ref: 'Tank',
  },
}, { _id: false });

const PurchaseOrderSchema: Schema<IPurchaseOrder> = new Schema(
  {
    supplier: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Supplier reference is required'],
    },
    station: {
      type: Schema.Types.ObjectId,
      ref: 'Station',
      required: [true, 'Station reference is required'],
    },
    orderNumber: {
      type: String,
      required: [true, 'Order number is required'],
      unique: true,
      trim: true,
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    deliveryDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['PENDING', 'DELIVERED', 'CANCELLED'],
      default: 'PENDING',
    },
    items: [PurchaseItemSchema],
    totalAmount: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    deliveredBy: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-calculate totalAmount before saving
PurchaseOrderSchema.pre('save', function (next) {
  if (this.items && this.items.length > 0) {
    this.totalAmount = parseFloat(
      this.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toFixed(3)
    );
  }
  next();
});

export const PurchaseOrder = mongoose.model<IPurchaseOrder>('PurchaseOrder', PurchaseOrderSchema);
