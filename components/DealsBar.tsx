export default function DealsBar() {
  return (
    <div className="flex items-center gap-3 px-4 pt-3 pb-2">
      <span className="h-8 w-1 rounded-full bg-gradient-to-b from-[#c13d91] to-[#78145d]" />
      <div>
        <h2 className="text-[17px] font-extrabold tracking-[-0.02em] text-[#3d1835]">
          Explore the collection
        </h2>
        <p className="mt-0.5 text-[11px] text-[#77717a]">Find something you love</p>
      </div>
    </div>
  );
}
