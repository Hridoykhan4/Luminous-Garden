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

  const onSubmit = async (data) => {
    if (!uploadImage.image) return toast.error("Please upload a plant image!");

    setLoading(true);
    const toastId = toast.loading("Listing your plant...");
    try {
      const imageUrl = await imageUpload(uploadImage.image);

      const plantData = {
        ...data,
        image: imageUrl,
        seller: {
          name: user?.displayName,
          image: user?.photoURL,
          email: user?.email,
        },
      };

      await axiosSecure.post("/plants", plantData);
      toast.success("Plant listed successfully!", { id: toastId });
      navigate("/dashboard/my-plants");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <AddPlantForm {...{ onSubmit, uploadImage, setUploadImage, loading }} />
    </div>
  );
};

export default AddPlant;