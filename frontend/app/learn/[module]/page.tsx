import ModuleContent from "@/components/learn/ModuleContent";

export default function ModulePage({ params }: { params: { module: string } }) {
  return <ModuleContent moduleId={params.module} />;
}
