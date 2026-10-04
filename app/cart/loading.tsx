export default function Loading() {
  return (
    <div className="min-h-screen w-full bg-[#fffdf8] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-[#f8efd9]" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#126044] animate-spin" />
        </div>
        <p className="text-sm font-semibold text-[#52665d] animate-pulse">
          Loading your cart...
        </p>
      </div>
    </div>
  );
}
