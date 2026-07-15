import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { envVars } from "../config/env";

let configured = false;

function ensureConfigured() {
  if (configured) return;

  if (
    !envVars.CLOUDINARY_CLOUD_NAME ||
    !envVars.CLOUDINARY_API_KEY ||
    !envVars.CLOUDINARY_API_SECRET
  ) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }

  cloudinary.config({
    cloud_name: envVars.CLOUDINARY_CLOUD_NAME,
    api_key: envVars.CLOUDINARY_API_KEY,
    api_secret: envVars.CLOUDINARY_API_SECRET,
    secure: true,
  });
  configured = true;
}

export function uploadImageBuffer(
  buffer: Buffer,
  folder: string,
): Promise<UploadApiResponse> {
  ensureConfigured();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `buddy-script/${folder}`,
        resource_type: "image",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error("Cloudinary upload failed"));
        }
        resolve(result);
      },
    );
    uploadStream.end(buffer);
  });
}

export async function deleteImage(publicId: string): Promise<void> {
  ensureConfigured();
  await cloudinary.uploader.destroy(publicId);
}

export function getPublicIdFromUrl(url: string): string | null {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
  return match ? match[1] : null;
}
