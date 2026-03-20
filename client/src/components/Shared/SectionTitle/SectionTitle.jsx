const SectionTitle = ({ heading, subheading }) => (
  <div className="mb-12 space-y-2">
    <h2 className="text-4xl font-black text-neutral-800 tracking-tight italic">
      {heading}
    </h2>
    <div className="h-1 w-20 bg-emerald-500 rounded-full" />
    <p className="text-neutral-500 font-medium">{subheading}</p>
  </div>
);

export default SectionTitle;
