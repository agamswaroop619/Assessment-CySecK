export function Avatar({ src, alt = "", size = 32, className = "" }) {
    return (
        <img
            src={src}
            alt={alt}
            className={`shrink-0 rounded-full object-cover ring-2 ring-slate-200/80 ${className}`}
            style={{ width: size, height: size }}
            loading="lazy"
        />
    );
}
