// c:\Users\shiva\Downloads\project\PlacementOS\src\components\custom\ProgressiveBlur.tsx
import { cn } from "@/lib/utils";

export const ProgressiveBlur = ({
    className,
    direction = "bottom",
}: {
    className?: string;
    direction?: "top" | "bottom" | "left" | "right";
}) => {
    const directionMap = {
        top: "to top",
        bottom: "to bottom",
        left: "to left",
        right: "to right",
    };

    return (
        <div
            className={cn(
                "pointer-events-none absolute inset-0 z-50 h-full w-full",
                className
            )}
            style={{
                backdropFilter: "blur(4px)",
                maskImage: `linear-gradient(${directionMap[direction]}, transparent, black)`,
                WebkitMaskImage: `linear-gradient(${directionMap[direction]}, transparent, black)`,
            }}
        />
    );
};
