import { MotionDiv } from "./motionPrimitives.js";

export function SideNav({ items = [], activeKey, onChange, className = "" }) {
    return (
        <div className={`rounded-3xl border border-white/60 bg-white/80 p-3 shadow-sm backdrop-blur-sm ${className}`}>
            <div className="space-y-1.5">
                {items.map((item) => {
                    const Icon = item.icon;
                    const active = item.key === activeKey;
                    return (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => onChange?.(item.key)}
                            className={`relative flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition ${
                                active ? "text-violet-800" : "text-slate-600 hover:bg-violet-50/70"
                            }`}
                            aria-current={active ? "page" : undefined}
                        >
                            {active && (
                                <MotionDiv
                                    layoutId="sideNavActive"
                                    className="absolute inset-0 rounded-2xl bg-violet-100/80"
                                    transition={{ type: "spring", stiffness: 520, damping: 42 }}
                                />
                            )}
                            <span className="relative flex items-center gap-3">
                                {Icon ? <Icon size={18} /> : null}
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
