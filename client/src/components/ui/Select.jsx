export function Select(props) {
    return (
        <select
            {...props}
            className={`w-full rounded-2xl border border-violet-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100 ${props.className || ""}`}
        />
    );
}
