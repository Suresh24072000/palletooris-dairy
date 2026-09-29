import { CheckCircle2, Circle, Clock, Truck, Package, Sparkles, XCircle } from "lucide-react";
import { OrderStatus } from "@/types/dairy";

interface OrderTimelineProps {
  currentStatus: OrderStatus;
}

const STEPS: { status: OrderStatus; label: string; icon: typeof Clock }[] = [
  { status: "confirmed", label: "Order Confirmed", icon: CheckCircle2 },
  { status: "preparing", label: "Freshly Sourced", icon: Sparkles },
  { status: "packed", label: "Insulated & Packed", icon: Package },
  { status: "out_for_delivery", label: "Out for Delivery", icon: Truck },
  { status: "delivered", label: "Delivered Fresh", icon: CheckCircle2 },
];

const ORDER_INDEX_MAP: Record<OrderStatus, number> = {
  pending: 0,
  confirmed: 1,
  preparing: 2,
  packed: 3,
  out_for_delivery: 4,
  delivered: 5,
  cancelled: -1,
};

export default function OrderTimeline({ currentStatus }: OrderTimelineProps) {
  if (currentStatus === "cancelled") {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          <XCircle size={24} />
        </div>
        <p className="mt-2 text-sm font-bold text-red-800">This order has been cancelled.</p>
        <p className="text-xs text-red-600 mt-1">If money was deducted, refund will reflect in 3-5 business days.</p>
      </div>
    );
  }

  const currentIndex = ORDER_INDEX_MAP[currentStatus] || 1;

  return (
    <div className="w-full py-4">
      {/* DESKTOP TIMELINE */}
      <div className="hidden sm:flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-gray-200 -z-0" />
        <div
          className="absolute top-1/2 left-0 h-1 -translate-y-1/2 bg-[#126044] transition-all duration-500 -z-0"
          style={{
            width: `${Math.min(100, Math.max(0, ((currentIndex - 1) / (STEPS.length - 1)) * 100))}%`,
          }}
        />

        {STEPS.map((step, idx) => {
          const stepIndex = idx + 1;
          const isDone = currentIndex > stepIndex;
          const isCurrent = currentIndex === stepIndex;

          return (
            <div key={step.status} className="relative z-10 flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                  isDone
                    ? "border-[#126044] bg-[#126044] text-white shadow"
                    : isCurrent
                    ? "border-[#126044] bg-white text-[#126044] shadow-md ring-4 ring-[#126044]/20 animate-pulse"
                    : "border-gray-300 bg-white text-gray-400"
                }`}
              >
                {isDone ? (
                  <CheckCircle2 size={18} />
                ) : isCurrent ? (
                  <step.icon size={18} />
                ) : (
                  <Circle size={16} />
                )}
              </div>
              <span
                className={`mt-2 text-xs font-bold tracking-tight text-center max-w-[90px] ${
                  isDone || isCurrent ? "text-[#173b27]" : "text-gray-400 font-medium"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* MOBILE VERTICAL TIMELINE */}
      <div className="sm:hidden space-y-4 relative pl-6 border-l-2 border-[#126044]/30 ml-2">
        {STEPS.map((step, idx) => {
          const stepIndex = idx + 1;
          const isDone = currentIndex > stepIndex;
          const isCurrent = currentIndex === stepIndex;

          return (
            <div key={step.status} className="relative flex items-center gap-3">
              <div
                className={`absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white ${
                  isDone
                    ? "border-[#126044] bg-[#126044] text-white"
                    : isCurrent
                    ? "border-[#126044] text-[#126044] ring-2 ring-[#126044]/30 animate-pulse"
                    : "border-gray-300 text-gray-300"
                }`}
              >
                {isDone ? <CheckCircle2 size={14} /> : <Circle size={12} />}
              </div>
              <div>
                <p
                  className={`text-xs font-bold ${
                    isDone || isCurrent ? "text-[#173b27]" : "text-gray-400"
                  }`}
                >
                  {isDone ? "✓ " : isCurrent ? "→ " : "○ "}
                  {step.label}
                </p>
                {isCurrent && (
                  <p className="text-[10px] text-[#b77932] font-semibold">In Progress right now</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
