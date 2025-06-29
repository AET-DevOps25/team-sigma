import { createFileRoute } from "@tanstack/react-router";
import { LectureManager } from "../../components/LectureManager";

export const Route = createFileRoute("/_authed/")({
  component: Index,
});

function Index() {
  return (
    <div className="h-screen w-full bg-gray-50">
      <LectureManager />
    </div>
  );
}
