import { Button } from "@/components/ui/button";
import { Share } from "lucide-react";

export default function ShareButton(
  props: React.ComponentProps<typeof Button>,
) {
  return (
    <Button variant="outline" {...props}>
      <Share />
    </Button>
  );
}
