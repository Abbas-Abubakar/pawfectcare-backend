
import User from '../models/user.model.js';
import AppError from '../utils/appError.utils.js';
import { uploadBufferToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryUpload.utils.js';
import asyncErrorHandler from '../utils/asyncErrorHandler.utils.js';

/**
 * @route   PATCH /api/users/me
 * @desc    Update the logged-in user's profile (name, phone, photo)
 */
export const updateProfile = asyncErrorHandler(async (req, res) => {

    const { name, phone } = req.body;

    if (name !== undefined) req.user.name = name;
    if (phone !== undefined) req.user.phone = phone;

    if (req.file) {
      if (req.user.profilePhoto?.publicId) {
        await deleteFromCloudinary(req.user.profilePhoto.publicId);
      }
      const uploaded = await uploadBufferToCloudinary(req.file.buffer, 'pawfectcare/avatars');
      req.user.profilePhoto = { url: uploaded.url, publicId: uploaded.publicId };
    }

    await req.user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: req.user.toSafeObject(),
    });

});

/**
 * @route   PATCH /api/users/me/password
 * @desc    Change password while logged in (requires current password)
 */
export const changePassword = asyncErrorHandler(async (req, res) => {

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new AppError('Current and new password are required.', 400);
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
      throw new AppError('Current password is incorrect.', 401);
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  
});

/**
 * @route   DELETE /api/users/me
 * @desc    Deactivate own account (soft delete)
 */
export const deactivateAccount = asyncErrorHandler(async (req, res) => {

    req.user.isActive = false;
    await req.user.save();

    res.status(200).json({
      success: true,
      message: 'Account deactivated.',
    });
  
});