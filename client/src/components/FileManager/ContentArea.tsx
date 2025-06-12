import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import { OrganizationProfile, useOrganization } from "@clerk/clerk-react";

const ContentArea: React.FC = () => {
  const { membership } = useOrganization();
  const [showOrgEditPanel, setShowOrgEditPanel] = useState(false);

  useEffect(() => {
    const handleToggleOrgEdit = () => {
      setShowOrgEditPanel(prev => !prev);
    };

    window.addEventListener('toggle-org-edit', handleToggleOrgEdit);
    
    return () => {
      window.removeEventListener('toggle-org-edit', handleToggleOrgEdit);
    };
  }, []);

  return (
    <div className="relative flex flex-col w-full h-full">
      {/* Slide-down panel */}
      {showOrgEditPanel && (
        <div className="absolute top-0 right-0 left-0 z-50 border-b border-gray-200 bg-white p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Edit Lecture</h2>
            <Button variant="ghost" onClick={() => setShowOrgEditPanel(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <OrganizationProfile />
        </div>
      )}

      <div className="flex-1 bg-gray-50 p-6 h-full overflow-auto">
        {membership?.organization.name ? (
          <div className="rounded-lg bg-white p-6 shadow h-full">
            <h2 className="mb-4 text-xl font-semibold">{membership.organization.name} Materials</h2>
            <p className="text-gray-500">No materials uploaded yet.</p>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-400">Select a lecture to view its materials</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentArea;
