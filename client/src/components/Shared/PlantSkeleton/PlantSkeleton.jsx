const PlantSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div
          key={i}
          className="group relative bg-secondary/5 rounded-[2.5rem] p-4 border border-border/50 space-y-5 animate-shimmer"
        >
          {/* 1. IMAGE AREA */}
          <div className="relative aspect-4/5 w-full bg-muted/20 rounded-4xl overflow-hidden">
            {/* Subtle center icon placeholder */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <div className="w-20 h-20 rounded-full border-4 border-primary" />
            </div>
          </div>

          {/* 2. CONTENT AREA */}
          <div className="px-2 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                {/* Title Line */}
                <div className="h-6 w-3/4 bg-muted/30 rounded-lg" />
                {/* Category Line */}
                <div className="h-3 w-1/2 bg-muted/20 rounded-md" />
              </div>
              {/* Price Tag Placeholder */}
              <div className="h-8 w-16 bg-primary/10 rounded-xl" />
            </div>

            {/* 3. METRICS (The "SaaS" touch) */}
            <div className="flex gap-3 pt-2">
              <div className="h-6 w-20 bg-muted/10 rounded-full" />
              <div className="h-6 w-24 bg-muted/10 rounded-full" />
            </div>

            {/* 4. BUTTON AREA */}
            <div className="pt-2">
              <div className="h-12 w-full bg-muted/20 rounded-2xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlantSkeleton;
