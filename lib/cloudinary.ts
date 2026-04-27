import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
})

export { cloudinary }

export async function uploadToCloudinary(
  file: Buffer | string,
  folder = 'studio'
): Promise<{ url: string; public_id: string; width: number; height: number; format: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto', quality: 'auto', fetch_format: 'auto' },
      (err, result) => {
        if (err || !result) return reject(err)
        resolve({
          url:       result.secure_url,
          public_id: result.public_id,
          width:     result.width,
          height:    result.height,
          format:    result.format,
        })
      }
    )
    if (typeof file === 'string') {
      cloudinary.uploader.upload(file, { folder, resource_type: 'auto' }).then(resolve).catch(reject)
    } else {
      stream.end(file)
    }
  })
}

export async function deleteFromCloudinary(public_id: string) {
  return cloudinary.uploader.destroy(public_id)
}

export function getCloudinaryUrl(public_id: string, transforms?: string) {
  return cloudinary.url(public_id, {
    secure: true,
    transformation: transforms,
    quality: 'auto',
    fetch_format: 'auto',
  })
}
