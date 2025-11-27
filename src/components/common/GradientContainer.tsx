import type { ReactNode } from "react";

interface GradientContainerProps {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
}

export default function GradientContainer({
  children,
  className = "",
  innerClassName = "flex flex-col justify-between",
}: GradientContainerProps) {
  return (
    <div
      className={`
        w-full flex rounded-2xl shadow p-1.5 bg-linear-to-r
         from-blue-400 to-indigo-400 
         ${className}
         `}
    >
      <div
        className={`w-full h-full bg-white rounded-xl overflow-hidden ${innerClassName} shadow`}
      >
        {children}
      </div>
    </div>
  );
}
