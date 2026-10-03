import BlogPost from '../models/blogPost.model.js';
import AppError from '../utils/appError.utils.js';
import asyncErrorHandler from '../utils/asyncErrorHandler.utils.js'
import { uploadBufferToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryUpload.utils.js';
import { buildTextSearchStage } from '../utils/atlasSearch.utils.js';
/**
 * @route   POST /api/blog
 * @desc    Create a blog post (veterinarian or shelter_admin)
 */
export const createBlogPost = asyncErrorHandler(async (req, res, next) => {
  const { title, content, excerpt, category } = req.body;

  if (!title || !content || !category) {
    throw new AppError('Title, content, and category are required.', 400);
  }

  let coverImage = { url: '', publicId: '' };
  if (req.file) {
    const uploaded = await uploadBufferToCloudinary(req.file.buffer, 'pawfectcare/blog');
    coverImage = { url: uploaded.url, publicId: uploaded.publicId };
  }

  const post = await BlogPost.create({
    author: req.user._id,
    title,
    content,
    excerpt,
    category,
    coverImage,
  });

  res.status(201).json({
    success: true,
    message: 'Blog post published successfully.',
    post,
  });

});

/**
 * @route   GET /api/blog
 * @desc    Browse/search blog posts — supports ?category=, ?search=
 */
export const getBlogPosts = asyncErrorHandler(async (req, res) => {

  const { category, search } = req.query;
  const matchFilter = { isActive: true };
  if (category) matchFilter.category = category;

  let posts;

  if (search) {
    posts = await BlogPost.aggregate([
      buildTextSearchStage('blog_search', search, [
        { path: 'title', boost: 3 },
        { path: 'excerpt', boost: 2 },
        { path: 'content', boost: 1 },
      ]),
      { $match: matchFilter },
      { $addFields: { score: { $meta: 'searchScore' } } },
      { $sort: { score: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author',
        },
      },
      { $unwind: '$author' },
      { $project: { 'author.name': 1, 'author.role': 1, title: 1, content: 1, excerpt: 1, category: 1, coverImage: 1, createdAt: 1, score: 1 } },
    ]);
  } else {
    posts = await BlogPost.find(matchFilter)
      .populate('author', 'name role')
      .sort({ createdAt: -1 });
  }

  res.status(200).json({
    success: true,
    count: posts.length,
    posts,
  });

});

/**
 * @route   GET /api/blog/:id
 */
export const getBlogPostById = asyncErrorHandler(async (req, res) => {

  const post = await BlogPost.findOne({ _id: req.params.id, isActive: true }).populate(
    'author',
    'name role'
  );

  if (!post) {
    throw new AppError('Blog post not found.', 404);
  }

  res.status(200).json({
    success: true,
    post,
  });

});

/**
 * @route   PATCH /api/blog/:id
 * @desc    Update a blog post (author only)
 */
export const updateBlogPost = asyncErrorHandler(async (req, res) => {

  const post = await BlogPost.findOne({ _id: req.params.id, isActive: true });

  if (!post) {
    throw new AppError('Blog post not found.', 404);
  }

  if (post.author.toString() !== req.user._id.toString()) {
    throw new AppError('You do not have permission to edit this post.', 403);
  }

  const allowedFields = ['title', 'content', 'excerpt', 'category'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      post[field] = req.body[field];
    }
  });

  if (req.file) {
    if (post.coverImage?.publicId) {
      await deleteFromCloudinary(post.coverImage.publicId);
    }
    const uploaded = await uploadBufferToCloudinary(req.file.buffer, 'pawfectcare/blog');
    post.coverImage = { url: uploaded.url, publicId: uploaded.publicId };
  }

  await post.save();

  res.status(200).json({
    success: true,
    message: 'Blog post updated successfully.',
    post,
  });

});

/**
 * @route   DELETE /api/blog/:id
 * @desc    Soft-delete a blog post (author only)
 */
export const deleteBlogPost = asyncErrorHandler(async (req, res) => {

  const post = await BlogPost.findOne({ _id: req.params.id, isActive: true });

  if (!post) {
    throw new AppError('Blog post not found.', 404);
  }

  if (post.author.toString() !== req.user._id.toString()) {
    throw new AppError('You do not have permission to delete this post.', 403);
  }

  post.isActive = false;
  await post.save();

  res.status(200).json({
    success: true,
    message: 'Blog post deleted successfully.',
  });

});