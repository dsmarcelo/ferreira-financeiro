import { format } from "date-fns";
import { use } from "react";

export default function ListByDate({
  data,
}: {
  data: Promise<any[]>;
}) {
  const allData = use(data);

  return <div>ListByDate</div>;
}