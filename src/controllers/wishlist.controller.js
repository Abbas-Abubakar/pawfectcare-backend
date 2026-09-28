import Wishlist from '../models/wishlist.model.js';
import Product from '../models/product.model.js';
import AppError from '../utils/appError.utils.js';
import asyncErrorHandler from '../utils/asyncErrorHandler.utils.js';

/**
 * @route   GET /api/wishlist
 * @desc    Get the logged-in owner's wishlist (with populated product details)
 */
export const getWishlist = asyncErrorHandler(async (req, res, next) => {
  let wishlist = await Wishlist.findOne({ owner: req.user._id }).populate({
    path: 'products',
    match: { isActive: true },
  });

  if (!wishlist) {
    // No wishlist yet — return an empty one rather than a 404;
    // simplifies frontend logic (no special-casing "not found" for a new user)
    return res.status(200).json({
      status: "success",
      wishlist: { products: [] },
    });
  }

  res.status(200).json({
    status: "success",
    wishlist,
  });
});

/**
 * @route   POST /api/wishlist/:productId
 * @desc    Add a product to the wishlist
 */
export const addToWishlist = asyncErrorHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) {
    throw new AppError('Product not found.', 404);
  }

  let wishlist = await Wishlist.findOne({ owner: req.user._id });

  if (!wishlist) {
    wishlist = await Wishlist.create({ owner: req.user._id, products: [productId] });
  } else if (!wishlist.products.includes(productId)) {
    wishlist.products.push(productId);
    await wishlist.save();
  }

  res.status(200).json({
    status: "success",
    message: 'Product added to wishlist.',
    wishlist,
  });
});

/**
 * @route   DELETE /api/wishlist/:productId
 * @desc    Remove a product from the wishlist
 */
export const removeFromWishlist = asyncErrorHandler(async (req, res, next) => {

  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ owner: req.user._id });

  if (!wishlist) {
    throw new AppError('Wishlist not found.', 404);
  }

  wishlist.products = wishlist.products.filter((id) => id.toString() !== productId);
  await wishlist.save();

  res.status(200).json({
    status: "success",
    message: 'Product removed from wishlist.',
    wishlist,
  });

});