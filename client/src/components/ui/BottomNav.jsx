import { MotionDiv } from "./motionPrimitives.js";

export function BottomNav({ items = [], activeKey, onChange, className = "" }) {
    return (
        <div
            className={`fixed bottom-0 left-0 right-0 z-40 border-t border-violet-100 bg-white/80 backdrop-blur-sm ${className}`}
        >
            <div className="mx-auto flex max-w-4xl items-stretch justify-around gap-2 px-3 py-2">
                {items.map((item) => {
                    const Icon = item.icon;
                    const active = item.key === activeKey;
                    return (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => onChange?.(item.key)}
                            className={`relative flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-xs font-semibold transition ${
                                active ? "text-violet-800" : "text-slate-500"
                            }`}
                            aria-current={active ? "page" : undefined}
                        >
                            {active && (
                                <MotionDiv
                                    layoutId="bottomNavActive"
                                    className="absolute inset-0 rounded-2xl bg-violet-100/80"
                                    transition={{ type: "spring", stiffness: 520, damping: 42 }}
                                />
                            )}
                            <span className="relative flex flex-col items-center gap-1">
                                {Icon ? <Icon size={18} /> : null}
                                <span>{item.label}</span>
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
