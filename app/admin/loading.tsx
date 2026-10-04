export default function Loading() {
  return (
    <div className="min-h-screen w-full bg-[#173b27] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-white/10" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#c77828] animate-spin" />
        </div>
        <p className="text-sm font-semibold text-white/60 animate-pulse">
          Loading admin dashboard...
        </p>
      </div>
    </div>
  );
}
