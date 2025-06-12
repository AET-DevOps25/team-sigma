import React, { useRef } from "react";
import { OrganizationSwitcher, useOrganization } from "@clerk/clerk-react";
import { Button } from "../ui/button";
import { Upload } from "lucide-react";

const AppHeader: React.FC = () => {
  const { membership } = useOrganization();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const fileItem = {
          id: `file_${Date.now()}_${Math.random()}`,
          name: file.name,
          type: file.type,
          size: file.size,
          uploadDate: new Date().toISOString(),
        };
        // TODO: handle file upload logic
        void fileItem;
      });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-4 py-3 flex items-center justify-between">
        <OrganizationSwitcher
          hidePersonal
          afterCreateOrganizationUrl="/dashboard"
          afterSelectOrganizationUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: "w-64",
              organizationSwitcherTrigger:
                "w-full flex items-center justify-between gap-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100 transition-colors",
              organizationPreviewText:
                "truncate max-w-[150px] overflow-hidden text-sm font-medium",
              organizationPreviewTextContainer: "flex-1",
              organizationImage: "w-6 h-6",
              organizationSwitcherPopoverCard: "w-80 max-w-full shadow-lg",
              organizationSwitcherPopoverActions: "p-2",
              organizationList: "max-h-[300px] overflow-auto",
            }
          }}
        />
        
        <div className="flex gap-3">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
          />
          <Button onClick={() => window.dispatchEvent(new CustomEvent('toggle-org-edit'))}>
            Edit lecture
          </Button>
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Materials
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader; 