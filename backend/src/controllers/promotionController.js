import Promotion from '../models/Promotion.js';
import asyncHandler from '../middleware/asyncHandler.js';

const computeDiscount = (promotion, subtotal) => {
  if (promotion.discountType === 'percentage') {
    return Number(((subtotal * promotion.value) / 100).toFixed(2));
  }
  return Number(Math.min(promotion.value, subtotal).toFixed(2));
};

export const validatePromoCode = asyncHandler(async (req, res) => {
  const { code, subtotal } = req.body;
  const parsedSubtotal = Number(subtotal) || 0;

  if (!code) {
    res.status(400);
    throw new Error('Promo code is required');
  }

  const promotion = await Promotion.findOne({ code: code.toUpperCase().trim() });

  if (!promotion || !promotion.isActive) {
    res.status(404);
    throw new Error('Invalid or inactive promo code');
  }

  const now = new Date();
  if (promotion.startsAt && now < promotion.startsAt) {
    res.status(400);
    throw new Error('This promo code is not active yet');
  }

  if (promotion.endsAt && now > promotion.endsAt) {
    res.status(400);
    throw new Error('This promo code has expired');
  }

  if (promotion.maxUsage && promotion.usageCount >= promotion.maxUsage) {
    res.status(400);
    throw new Error('This promo code has reached its usage limit');
  }

  if (promotion.minOrderAmount && parsedSubtotal < promotion.minOrderAmount) {
    res.status(400);
    throw new Error(`Add Rs. ${(promotion.minOrderAmount - parsedSubtotal).toFixed(2)} more to use this code`);
  }

  const discountAmount = computeDiscount(promotion, parsedSubtotal);

  res.json({
    code: promotion.code,
    title: promotion.title,
    discountType: promotion.discountType,
    value: promotion.value,
    discountAmount
  });
});
