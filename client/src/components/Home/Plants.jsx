import usePlants from "@/hooks/usePlants";
import PlantCard from "../Shared/PlantCard";
import PlantSkeleton from "../Shared/PlantSkeleton/PlantSkeleton";

const Plants = () => {
    const {data: plants = [], isLoading: plantsLoading} = usePlants()
    if(plantsLoading) return <PlantSkeleton></PlantSkeleton>
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {plants.map((plant) => (
          <PlantCard key={plant._id} plant={plant} />
        ))}
      </div>
    );
};

export default Plants;