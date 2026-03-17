import { useState } from "react";
import axios from "axios";

const useUploadProgress = () => {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const uploadWithProgress = async (url, formData) => { 
    setProgress(0);
    setIsUploading(true);
    setError(null);

    try {
      const { data } = await axios.post(url, formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        },
      });
      setIsUploading(false);
      return data;
    } catch (err) {
      setIsUploading(false);
      setError(err.message || "Upload failed");
      throw err; 
    }
  };

  return { progress, isUploading, error, uploadWithProgress };
};

export default useUploadProgress;