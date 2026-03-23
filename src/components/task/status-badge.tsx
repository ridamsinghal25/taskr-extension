import { Badge } from "@/components/ui/badge";
import  { TaskStatus } from "@/types/task";
import { CheckCircle, Clock, AlertCircle, Archive } from "lucide-react";

interface StatusBadgeProps {
  status: TaskStatus;
  size?: "sm" | "md";
  isSelected?: boolean;
}

const statusConfig = {
  [TaskStatus.InProgress]: {
    label: "In Progress",
    icon: Clock,
    soft: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    solid: "bg-blue-500 text-white border-transparent",
  },
  [TaskStatus.Done]: {
    label: "Done",
    icon: CheckCircle,
    soft: "bg-green-500/10 text-green-500 border-green-500/20",
    solid: "bg-green-600 text-white border-transparent",
  },
  [TaskStatus.Pending]: {
    label: "Pending",
    icon: AlertCircle,
    soft: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    solid: "bg-yellow-500 text-black border-transparent",
  },
  [TaskStatus.Archived]: {
    label: "Archived",
    icon: Archive,
    soft: "bg-muted text-muted-foreground border-border",
    solid: "bg-gray-400 text-background border-white/20",
  },
};

export function StatusBadge({
  status,
  size = "sm",
  isSelected = false,
}: StatusBadgeProps) {
  const config = statusConfig[status];

  const Icon = config.icon;

  const sizeClasses =
    size === "sm" ? "px-2 py-0.5 text-xs gap-1" : "px-3 py-1 text-sm gap-1.5";

  const style = isSelected ? config.solid : config.soft;

  return (
    <Badge
      variant="outline"
      className={`flex items-center cursor-pointer rounded-full font-medium ${sizeClasses} ${style} transition hover:scale-105`}
    >
      <Icon className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />
      {config.label}
    </Badge>
  );
}
