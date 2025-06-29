import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DocumentsViewer } from "../../../components/DocumentsViewer";
import { useLecture } from "../../../hooks/useApi";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authed/documents/$lectureId")({
  component: DocumentsRoute,
});

function DocumentsRoute() {
  const { lectureId } = Route.useParams();
  const navigate = useNavigate();
  
  const { data: lecture, isLoading, error } = useLecture(parseInt(lectureId as string));

  const handleBack = () => {
    navigate({ to: "/" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div>Loading lecture...</div>
      </div>
    );
  }

  if (error || !lecture) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading lecture</p>
          <Button
            variant="ghost"
            onClick={handleBack}
          >
            ← Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full">
      <DocumentsViewer 
        selectedLecture={lecture}
        onBack={handleBack}
      />
    </div>
  );
} 