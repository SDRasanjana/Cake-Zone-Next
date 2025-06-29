import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  imageUri: { type: String },
  isCustom: { type: Boolean, default: false },
  // Add more fields as needed (flavor, toppings, etc.)
}, { _id: false });

const ShippingSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: [OrderItemSchema],
  shipping: ShippingSchema,
  paymentStatus: { type: String, default: "pending" },
  paymentIntentId: { type: String },
  total: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
