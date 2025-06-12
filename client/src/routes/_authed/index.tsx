import { useEffect, useRef, useState } from "react";
import { SidebarProvider } from "../../components/ui/sidebar";
import ContentArea from "../../components/FileManager/ContentArea";
import { CreateOrganization } from "@clerk/clerk-react";
import { createFileRoute } from "@tanstack/react-router";
import AppHeader from "../../components/FileManager/AppHeader";

export const Route = createFileRoute("/_authed/")({
  component: Index,
});

function Index() {
  const [showCreateOrgDialog, setShowCreateOrgDialog] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dialogRef.current &&
        !dialogRef.current.contains(event.target as Node)
      ) {
        setShowCreateOrgDialog(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowCreateOrgDialog(false);
      }
    }

    if (showCreateOrgDialog) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showCreateOrgDialog]);

  return (
    <SidebarProvider>
      {showCreateOrgDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div ref={dialogRef}>
            <CreateOrganization />
          </div>
        </div>
      )}

      <div className="flex flex-col h-screen w-full bg-gray-50">
        <AppHeader />
        <div className="flex flex-1 overflow-hidden">
          <ContentArea />
        </div>
      </div>
    </SidebarProvider>
  );
}
