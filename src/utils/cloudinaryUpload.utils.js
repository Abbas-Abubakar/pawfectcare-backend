import cloudinary from "../config/cloudinary.js"

/**
 * 
 * Uploads a file buffer from multer memory storage to cloudinary
 */

export const uploadBufferToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {folder, resource_type: 'image'},
      (error, result) => {
        if(error) return reject(error)
        resolve({url: result.secure_url, publicId: result.public_id})
      }
    )
    stream.end(buffer)
  })
}

/**
 * Deletes an image from cloudinary by its public_id
 */

export const deleteFromCloudinary = async(publicId) => {
  if(!publicId) return

  await cloudinary.uploader.destroy(publicId)
}