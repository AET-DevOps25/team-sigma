import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { LectureManager } from "../../components/LectureManager";
import type { Lecture } from "../../hooks/useApi";

export const Route = createFileRoute("/_authed/")({
  component: Index,
});

function Index() {
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);

  return (
    <div className="h-screen w-full bg-gray-50">
      <LectureManager 
        selectedLecture={selectedLecture}
        onLectureSelect={setSelectedLecture}
      />
    </div>
  );
}
