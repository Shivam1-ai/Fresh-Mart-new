import mongoose from 'mongoose';

const productInquirySchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    question: { type: String, required: true, trim: true },
    answer: { type: String, trim: true },
    status: { type: String, enum: ['Open', 'Answered', 'Closed'], default: 'Open' },
    answeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    answeredAt: Date
  },
  { timestamps: true }
);

const ProductInquiry = mongoose.model('ProductInquiry', productInquirySchema);
export default ProductInquiry;