import { useState, useEffect } from "react";
import PlantCard from "@/components/Shared/PlantCard";
import PlantSkeleton from "@/components/Shared/PlantSkeleton/PlantSkeleton";
import usePlants from "@/hooks/usePlants";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  TbSearch,
  TbFilterX,
  TbChevronLeft,
  TbChevronRight,
} from "react-icons/tb";

const Plants = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 8; // SaaS Standard for grid layouts

  // 1. Fetch data using our advanced hook
  const {
    data: response = {},
    isLoading: plantsLoading,
    refetch,
    isPreviousData,
  } = usePlants({
    search,
    category: category === "all" ? "" : category,
    page,
    limit,
  });

  const plants = response.data || [];
  console.log(plants);
  const totalPages = response.totalPages || 1;

  // Reset to page 1 when searching or filtering
  useEffect(() => {
    setPage(1);
  }, [search, category]);

  const handleReset = () => {
    setSearch("");
    setCategory("all");
    setPage(1);
  };

  return (
    <section className="container-page section-spacing space-y-10">
      {/* --- SaaS SEARCH & FILTER BAR --- */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative w-full md:max-w-md group">
          <TbSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
            size={20}
          />
          <Input
            placeholder="Search specimens by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-12 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 transition-all"
          />
        </div>

        <div className="flex w-full md:w-auto gap-3">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full md:w-[180px] h-12 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-emerald-500/20">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-100">
              <SelectItem value="all">All Species</SelectItem>
              <SelectItem value="Indoor">Indoor</SelectItem>
              <SelectItem value="Outdoor">Outdoor</SelectItem>
              <SelectItem value="Succulent">Succulent</SelectItem>
              <SelectItem value="Medicinal">Medicinal</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={handleReset}
            className="h-12 w-12 rounded-2xl border-slate-100 hover:bg-rose-50 hover:text-rose-500 transition-all"
          >
            <TbFilterX size={20} />
          </Button>
        </div>
      </div>

      {/* --- GRID DISPLAY --- */}
      {plantsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[...Array(limit)].map((_, i) => (
            <PlantSkeleton key={i} />
          ))}
        </div>
      ) : plants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {plants.map((plant) => (
            <PlantCard key={plant._id} plant={plant} refetch={refetch} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center space-y-4">
          <div className="size-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
            <TbFilterX className="text-slate-300" size={40} />
          </div>
          <p className="text-slate-500 font-medium">
            No specimens match your current filters.
          </p>
        </div>
      )}

      {/* --- PRO PAGINATION --- */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-10">
          <Button
            variant="ghost"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="size-12 rounded-2xl hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-30 transition-all"
          >
            <TbChevronLeft size={24} />
          </Button>

          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`size-12 rounded-2xl text-sm font-black transition-all ${
                  page === i + 1
                    ? "bg-slate-900 text-white shadow-lg"
                    : "bg-white border border-slate-100 text-slate-400 hover:border-emerald-500 hover:text-emerald-500"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <Button
            variant="ghost"
            disabled={page === totalPages || isPreviousData}
            onClick={() => setPage((p) => p + 1)}
            className="size-12 rounded-2xl hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-30 transition-all"
          >
            <TbChevronRight size={24} />
          </Button>
        </div>
      )}
    </section>
  );
};

export default Plants;
