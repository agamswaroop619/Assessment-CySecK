export function PageWrap({ children, max = "max-w-4xl" }) {
    return (
        <div className={`mx-auto w-full ${max} px-4 py-8 sm:px-6 sm:py-10`}>
            {children}
        </div>
    );
}
