import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import AddPlantForm from "@/components/Form/AddPlantForm";
import useAuth from "@/hooks/useAuth";
import { imageUpload } from "@/api/utils";
import useAxiosSecure from "@/hooks/useAxiosSecure";

const AddPlant = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadImage, setUploadImage] = useState({ image: null, url: null });

  const onSubmit = async (formData) => {
    // 1. Pre-flight checks
    if (!uploadImage.image) return toast.error("Please upload a plant image!");
    if (!user?.email)
      return toast.error("User context missing. Please re-login.");

    setLoading(true);
    const toastId = toast.loading("Securely uploading specimen...");

    try {
      // 2. Image Upload
      const imageUrl = await imageUpload(uploadImage.image);

      // 3. MANUAL MAPPING (No spreading)
      const plantData = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        image: imageUrl,
        seller: {
          name: user?.displayName || "Anonymous",
          image: user?.photoURL || "",
          email: user?.email,
        },
      };

      // 4. API Call
      const { data } = await axiosSecure.post("/plants", plantData);

      if (data.insertedId) {
        toast.success("Plant added successfully!", { id: toastId });
        navigate("/dashboard/my-plants");
      }
    } catch (err) {
      console.error("Submission Error:", err);
      toast.error(err.response?.data?.message || "Failed to list plant", {
        id: toastId,
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-neutral-50/50 p-4 md:p-10">
      <AddPlantForm {...{ onSubmit, uploadImage, setUploadImage, loading }} />
    </div>
  );
};

export default AddPlant;
