import { AnimatePresence } from "framer-motion";
import { MotionDiv } from "./motionPrimitives.js";

export function AnimatedPanel({
    activeKey,
    children,
    className = "",
    initial = { opacity: 0, y: 8 },
    animate = { opacity: 1, y: 0 },
    exit = { opacity: 0, y: -8 },
    transition = { duration: 0.18 },
}) {
    return (
        <AnimatePresence mode="wait">
            <MotionDiv
                key={String(activeKey)}
                initial={initial}
                animate={animate}
                exit={exit}
                transition={transition}
                className={className}
            >
                {children}
            </MotionDiv>
        </AnimatePresence>
    );
}
