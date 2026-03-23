import { Badge } from "@/components/ui/badge";
import { Zap, AlertTriangle } from "lucide-react";
import { TaskType } from "@/types/task";

interface TypeBadgeProps {
  type: TaskType;
  size?: "sm" | "md";
  isSelected?: boolean;
}

const typeConfig = {
  [TaskType.Normal]: {
    label: "Normal",
    icon: Zap,
    soft: "bg-primary/10 text-primary border-primary/20",
    solid: "bg-primary text-primary-foreground border-transparent",
  },
  [TaskType.Critical]: {
    label: "Critical",
    icon: AlertTriangle,
    soft: "bg-destructive/10 text-destructive border-destructive/20",
    solid: "bg-destructive text-white border-transparent",
  },
};

export function TypeBadge({
  type,
  size = "sm",
  isSelected = false,
}: TypeBadgeProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  const sizeClasses =
    size === "sm" ? "px-2 py-0.5 text-xs gap-1" : "px-3 py-1 text-sm gap-1.5";

  const style = isSelected ? config.solid : config.soft;

  return (
    <Badge
      variant="outline"
      className={`flex items-center cursor-pointer rounded-full font-medium ${sizeClasses} ${style} transition-all duration-200 hover:scale-105`}
    >
      <Icon className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />
      {config.label}
    </Badge>
  );
}
