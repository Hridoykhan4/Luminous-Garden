import axios from "axios";

/**
 * @param {File} file
 * @param {Function} uploadFn
 */
export const imageUpload = async (file, uploadFn) => {
  if (!file) return null;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

  const url = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET}/image/upload`;

  try {
    if (uploadFn) {
      const data = await uploadFn(url, formData);
      return data?.secure_url;
    }

    const { data } = await axios.post(url, formData);
    return data?.secure_url;
  } catch (err) {
    console.error("Cloudinary Upload Error:", err);
    throw err;
  }
};
