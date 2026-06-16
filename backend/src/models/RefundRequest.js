import mongoose from 'mongoose';

const refundRequestSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ['Return', 'Refund', 'Dispute'], default: 'Refund' },
    reason: { type: String, required: true, trim: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Resolved'], default: 'Pending' },
    resolutionNote: String,
    handledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

const RefundRequest = mongoose.model('RefundRequest', refundRequestSchema);
export default RefundRequest;