import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';

/* Image storage. Screenshots live in Cloudinary under <CLOUDINARY_FOLDER>/<doc-id>/. */

export const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || 'aidocbuilder-docs';

let configured = false;
function client() {
  if (!configured) {
    const cloud_name = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    const api_key = process.env.CLOUDINARY_API_KEY?.trim();
    const api_secret = process.env.CLOUDINARY_API_SECRET?.trim();
    if (!cloud_name || !api_key || !api_secret) {
      throw new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in .env.local.');
    }
    cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
    configured = true;
  }
  return cloudinary;
}

export type UploadedImage = { url: string; publicId: string; width: number; height: number; bytes: number };

/** Uploads one image to <folder>/<doc>/<name> and returns its public https URL. */
export function uploadImage(data: Buffer, doc: string, name: string): Promise<UploadedImage> {
  return new Promise((resolve, reject) => {
    client()
      .uploader.upload_stream(
        { folder: `${CLOUDINARY_FOLDER}/${doc}`, public_id: name, overwrite: false, resource_type: 'image' },
        (error, result?: UploadApiResponse) => {
          if (error || !result) reject(new Error(error?.message ?? 'Cloudinary upload failed.'));
          else resolve({ url: result.secure_url, publicId: result.public_id, width: result.width, height: result.height, bytes: result.bytes });
        },
      )
      .end(data);
  });
}
