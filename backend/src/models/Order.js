import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    image: String,
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);

const trackingEventSchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    note: { type: String, required: true },
    location: String,
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    shippingAddress: { type: Object, required: true },
    paymentMethod: { type: String, enum: ['COD', 'Razorpay', 'Stripe'], default: 'COD' },
    paymentResult: {
      id: String,
      status: String,
      updateTime: String,
      email: String
    },
    trackingNumber: { type: String, unique: true, sparse: true },
    trackingEvents: [trackingEventSchema],
    itemsPrice: { type: Number, required: true, default: 0 },
    shippingPrice: { type: Number, required: true, default: 0 },
    taxPrice: { type: Number, required: true, default: 0 },
    discountAmount: { type: Number, default: 0 },
    promoCode: { type: String, trim: true, uppercase: true },
    totalPrice: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Paid', 'Packed', 'Shipped', 'Out for delivery', 'Delivered', 'Rejected', 'Cancelled'],
      default: 'Pending'
    },
    deliveredAt: Date,
    paidAt: Date
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
