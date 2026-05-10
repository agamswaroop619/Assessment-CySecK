export function PageHeader({ title, right }) {
    return (
        <div className="mb-8 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
                <img
                    src="/CySeck.png"
                    alt="CySecK logo"
                    className="h-10 w-10 rounded-lg object-cover"
                />
                <h1 className="text-3xl font-semibold tracking-tight text-slate-800">{title}</h1>
            </div>
            {right}
        </div>
    );
}
