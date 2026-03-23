import PlantCard from "@/components/Shared/PlantCard";
import PlantSkeleton from "@/components/Shared/PlantSkeleton/PlantSkeleton";
import usePlants from "@/hooks/usePlants";

const Plants = () => {
  // 1. Destructure refetch
  const {
    data: response = {},
    isLoading: plantsLoading,
    refetch,
  } = usePlants("");
  const plants = response.data || [];

  if (plantsLoading) {
    return (
      <div className="grid section-spacing grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {[...Array(8)].map((_, i) => (
          <PlantSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid container-page section-spacing grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {plants.map((plant) => (
        // 2. Pass refetch here too
        <PlantCard key={plant._id} plant={plant} refetch={refetch} />
      ))}
    </div>
  );
};
export default Plants;
