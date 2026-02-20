import { cn } from "@/lib/utils";

interface ViziAILogoProps {
  className?: string;
}

export function ViziAILogo({ className }: ViziAILogoProps): React.ReactElement {
  return (
    <span
      className={cn(
        "font-bold select-none inline-flex items-baseline",
        className,
      )}
    >
      <span className="text-primary">Vizi</span>
      <span className="text-secondary">AI</span>
    </span>
  );
}
