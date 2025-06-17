import { Badge } from "@/components/ui/badge";
import { getCategoryColorClasses, cn } from "@/lib/utils";

interface CategoryBadgeProps {
  color: string;
  name: string;
  className?: string;
}

export function CategoryBadge({ color, name, className }: CategoryBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "text-xs",
        getCategoryColorClasses(color),
        className
      )}
    >
      {name}
    </Badge>
  );
}