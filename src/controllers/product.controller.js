import Product from '../models/product.model.js';
import AppError from '../utils/appError.utils.js';
import { uploadBufferToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryUpload.utils.js';
import { buildTextSearchStage } from '../utils/atlasSearch.utils.js';
import asyncErrorHandler from "../utils/asyncErrorHandler.utils.js"
import { getPagination, buildPaginationMeta } from '../utils/pagination.utils.js';

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
  const { page, limit, skip } = getPagination(req.query);

  const matchFilter = { isActive: true };
  if (category) matchFilter.category = category;
  if (minPrice || maxPrice) {
    matchFilter.price = {};
    if (minPrice) matchFilter.price.$gte = Number(minPrice);
    if (maxPrice) matchFilter.price.$lte = Number(maxPrice);
  }

  let products;
  let totalCount;

  if (search) {
    const pipeline = [
      buildTextSearchStage('product_search', search, [
        { path: 'name', boost: 3 },
        { path: 'description', boost: 1 },
      ]),
      { $match: matchFilter },
      { $addFields: { score: { $meta: 'searchScore' } } },
      { $sort: { score: -1 } },
    ];

    // Run count and page-fetch as two aggregations sharing the same pipeline so far
    const [countResult, pagedResults] = await Promise.all([
      Product.aggregate([...pipeline, { $count: 'total' }]),
      Product.aggregate([...pipeline, { $skip: skip }, { $limit: limit }]),
    ]);

    totalCount = countResult[0]?.total || 0;
    products = pagedResults;
  } else {
    [products, totalCount] = await Promise.all([
      Product.find(matchFilter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(matchFilter),
    ]);
  }

  res.status(200).json({
    success: true,
    count: products.length,
    pagination: buildPaginationMeta(page, limit, totalCount),
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