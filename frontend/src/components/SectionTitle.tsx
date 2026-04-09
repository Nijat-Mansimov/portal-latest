export function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center my-12">
      <h2 className="text-3xl md:text-4xl font-bold text-[#1b2353] dark:text-white uppercase tracking-wider mb-4 text-center">
        {title}
      </h2>
      <div className="w-16 h-1 bg-[#1b2353] dark:bg-blue-500"></div>
    </div>
  );
}
