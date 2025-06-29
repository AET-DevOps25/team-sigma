import React from "react";
import { BookOpen } from "lucide-react";
import type { Document } from "../../hooks/useApi";

interface SummaryTabProps {
  document: Document;
}

const SummaryTab: React.FC<SummaryTabProps> = ({ document }) => {
  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <BookOpen className="h-5 w-5 mr-2" />
        Summary
      </h3>
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Document Details</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p><span className="font-medium">Name:</span> {document.name}</p>
            <p><span className="font-medium">File:</span> {document.originalFilename}</p>
            <p><span className="font-medium">Type:</span> {document.contentType}</p>
            <p><span className="font-medium">Size:</span> {(document.fileSize / 1024 / 1024).toFixed(2)} MB</p>
            <p><span className="font-medium">Chunks:</span> {document.chunkCount}</p>
            <p><span className="font-medium">Created:</span> {new Date(document.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        {document.description && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Description</h4>
            <p className="text-gray-700 leading-relaxed">{document.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryTab; 