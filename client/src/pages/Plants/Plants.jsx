import PlantCard from "@/components/Shared/PlantCard";
import PlantSkeleton from "@/components/Shared/PlantSkeleton/PlantSkeleton";
import usePlants from "@/hooks/usePlants";

const Plants = () => {
  const { data: plants = [], isLoading: plantsLoading } = usePlants();
  if (plantsLoading) return <PlantSkeleton></PlantSkeleton>;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {plants.map((plant) => (
        <PlantCard key={plant._id} plant={plant} />
      ))}
    </div>
  );
};

export default Plants;
