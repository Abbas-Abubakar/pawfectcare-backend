import multer from "multer";
import AppError from "../utils/appError.utils.js"

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if(allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new AppError("Only JPEG, PNG or WEBP are allowed", 400))
  }
}

export const upload = multer({
  storage, fileFilter, limits: {fileSize: 5 * 1024 * 1024}
})

export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).array('attachments', 5); // max 5 files per request