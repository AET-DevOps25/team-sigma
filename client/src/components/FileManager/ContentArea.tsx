import React, { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "../ui/button";
import { OrganizationProfile, useOrganization } from "@clerk/clerk-react";

const ContentArea: React.FC = ({}) => {
  const { membership } = useOrganization();

  const [showOrgEditPanel, setShowOrgEditPanel] = useState(false);
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
    <div className="relative flex flex-1 flex-col">
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

      <div className="border-b border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {membership?.organization.name || "No lecture selected"}
            </h1>
          </div>
          <div className="flex gap-3">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
            />
            <Button onClick={() => setShowOrgEditPanel(true)}>
              Edit lecture
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Lectures
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-gray-50 p-6">
        {/* Lecture content goes here */}
      </div>
    </div>
  );
};

export default ContentArea;
