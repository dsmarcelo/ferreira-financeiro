import { Badge } from "@/components/ui/badge";
import { getCategoryColorClasses, cn } from "@/lib/utils";

interface CategoryBadgeProps {
  color: string;
  name: string;
  emoji?: string;
  className?: string;
}

export function CategoryBadge({
  color,
  name,
  emoji,
  className,
}: CategoryBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn("text-xs px-1 py-0", getCategoryColorClasses(color), className)}
    >
      {emoji && <span>{emoji}</span>}
      {name}
    </Badge>
  );
}
