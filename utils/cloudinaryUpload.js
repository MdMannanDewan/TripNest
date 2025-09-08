const { Readable } = require("stream");
const cloudinary = require("../config/cloudinary");
const CustomError = require("./CustomError");

function uploadBufferToCloudinary(buffer, options = {}, timeoutMs = 60000) {
  return new Promise((resolve, reject) => {
    if (!buffer || !Buffer.isBuffer(buffer) || buffer.length === 0) {
      return reject(new CustomError(400, "Invalid or empty file buffer"));
    }

    const defaultOptions = {
      resource_type: "auto",
      folder: "uploads",
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      transformation: [
        { fetch_format: "auto", quality: "auto" }, // auto-optimize delivery
      ],
    };

    // merge default options with user-provided
    const finalOptions = { ...defaultOptions, ...options };

    const controller = new AbortController();
    const { signal } = controller;
    let uploadedPublicId = null; // track public_id if available

    const timer = setTimeout(() => {
      controller.abort(); // cancel stream
      if (uploadedPublicId) {
        // cleanup orphaned asset
        cloudinary.uploader
          .destroy(uploadedPublicId, {
            resource_type: finalOptions.resource_type,
          })
          .catch((err) =>
            console.error("Failed to cleanup orphan:", err.message)
          );
      }
      reject(new Error("Cloudinary upload aborted due to timeout"));
    }, timeoutMs);

    const uploadStream = cloudinary.uploader.upload_stream(
      finalOptions,
      (err, result) => {
        clearTimeout(timer);
        if (signal.aborted) return;

        if (err) {
          return reject(
            new CustomError(500, err.message || "Cloudinary upload failed")
          );
        }

        uploadedPublicId = result.public_id; // record it
        resolve(result);
      }
    );

    signal.addEventListener("abort", () => {
      uploadStream.destroy(new Error("Upload stream aborted"));
    });

    Readable.from(buffer).pipe(uploadStream);
  });
}

module.exports = { uploadBufferToCloudinary };
