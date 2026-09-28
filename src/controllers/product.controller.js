import Product from '../models/product.model.js';
import AppError from '../utils/appError.utils.js';
import { uploadBufferToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryUpload.utils.js';
import asyncErrorHandler from "../utils/asyncErrorHandler.utils.js"

/**
 * @route   POST /api/products
 * @desc    Create a new product (shelter_admin only, for now)
 */
export const createProduct = asyncErrorHandler(async (req, res) => {

  const { name, description, category, price, stock } = req.body;

  if (!name || !category || price === undefined) {
    throw new AppError('Name, category, and price are required.', 400);
  }

  let image = { url: '', publicId: '' };
  if (req.file) {
    const uploaded = await uploadBufferToCloudinary(req.file.buffer, 'pawfectcare/products');
    image = { url: uploaded.url, publicId: uploaded.publicId };
  }

  const product = await Product.create({ name, description, category, price, stock, image });

  res.status(201).json({
    success: true,
    message: 'Product created successfully.',
    product,
  });

});

/**
 * @route   GET /api/products
 * @desc    Browse products — supports ?category=, ?search=, ?minPrice=, ?maxPrice=
 */
export const getProducts = asyncErrorHandler(async (req, res) => {

  const { category, search, minPrice, maxPrice } = req.query;
  const filter = { isActive: true };

  if (category) filter.category = category;
  if (search) filter.$text = { $search: search };
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const products = await Product.find(filter).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: products.length,
    products,
  });

});

/**
 * @route   GET /api/products/:id
 */
export const getProductById = asyncErrorHandler(async (req, res) => {

  const product = await Product.findOne({ _id: req.params.id, isActive: true });

  if (!product) {
    throw new AppError('Product not found.', 404);
  }

  res.status(200).json({
    status: "success",
    product,
  });


});

/**
 * @route   PATCH /api/products/:id
 * @desc    Update a product (shelter_admin only)
 */
export const updateProduct = asyncErrorHandler(async (req, res) => {

  const product = await Product.findOne({ _id: req.params.id, isActive: true });

  if (!product) {
    throw new AppError('Product not found.', 404);
  }

  const allowedFields = ['name', 'description', 'category', 'price', 'stock'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      product[field] = req.body[field];
    }
  });

  if (req.file) {
    if (product.image?.publicId) {
      await deleteFromCloudinary(product.image.publicId);
    }
    const uploaded = await uploadBufferToCloudinary(req.file.buffer, 'pawfectcare/products');
    product.image = { url: uploaded.url, publicId: uploaded.publicId };
  }

  await product.save();

  res.status(200).json({
    status: "success",
    message: 'Product updated successfully.',
    product,
  });
});

/**
 * @route   DELETE /api/products/:id
 * @desc    Soft-delete a product (shelter_admin only)
 */
export const deleteProduct = asyncErrorHandler(async (req, res) => {

  const product = await Product.findOne({ _id: req.params.id, isActive: true });

  if (!product) {
    throw new AppError('Product not found.', 404);
  }

  product.isActive = false;
  await product.save();

  res.status(200).json({
    status: "success",
    message: 'Product deleted successfully.',
  });

});