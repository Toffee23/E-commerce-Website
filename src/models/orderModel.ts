import { Document, Schema, model, Types } from "mongoose";

interface SingleOrderItem {
  name: string;
  image: string;
  price: number;
  amount: number;
  product: Types.ObjectId;
}

interface Order extends Document {
  tax: number;
  shippingFee: number;
  subtotal: number;
  total: number;
  orderItems: SingleOrderItem[];
  status: "pending" | "failed" | "paid" | "delivered" | "canceled";
  user: Types.ObjectId;
  clientSecret: string;
  paymentId?: string;
}

const singleOrderItemSchema = new Schema<SingleOrderItem>({
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  amount: { type: Number, required: true },
  product: { type: Types.ObjectId, ref: "Product", required: true },
});

const OrderSchema = new Schema<Order>(
  {
    tax: {
      type: Number,
      required: true,
    },
    shippingFee: {
      type: Number,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    orderItems: [singleOrderItemSchema],
    status: {
      type: String,
      enum: ["pending", "failed", "paid", "delivered", "canceled"],
      default: "pending",
    },
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    clientSecret: {
      type: String,
      required: true,
    },
    paymentId: {
      type: String,
    },
  },
  { timestamps: true }
);

export default model<Order>("Order", OrderSchema);
