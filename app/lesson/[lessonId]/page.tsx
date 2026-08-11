import { notFound } from "next/navigation";
import { getLessonContext } from "@/lib/curriculum";
import LessonLoader from "@/components/LessonLoader";

export default async function LessonPage(props: PageProps<"/lesson/[lessonId]">) {
  const { lessonId } = await props.params;
  const context = getLessonContext(lessonId);

  if (!context) notFound();

  return <LessonLoader unit={context.unit} lesson={context.lesson} />;
}
