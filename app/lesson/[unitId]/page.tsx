import { notFound } from "next/navigation";
import { getUnit } from "@/lib/curriculum";
import LessonLoader from "@/components/LessonLoader";

export default async function LessonPage(props: PageProps<"/lesson/[unitId]">) {
  const { unitId } = await props.params;
  const unit = getUnit(unitId);

  if (!unit) notFound();

  return <LessonLoader unit={unit} />;
}
