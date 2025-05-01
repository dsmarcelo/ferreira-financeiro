import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DownloadButton(
  props: React.ComponentProps<typeof Button>,
) {
  return (
    <Button variant="outline" {...props}>
      <Download />
    </Button>
  );
}
