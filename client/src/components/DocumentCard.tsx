import { Link } from "@tanstack/react-router";
import { type Document } from "../hooks/useApi";
import { Button } from "./ui/button";

interface DocumentCardProps {
  document: Document;
  showActions?: boolean;
  onDownload?: (doc: Document) => void;
  onDelete?: (id: number, name: string) => void;
  isDownloading?: boolean;
  isDeleting?: boolean;
}

export default function DocumentCard({
  document,
  showActions = false,
  onDownload,
  onDelete,
  isDownloading = false,
  isDeleting = false,
}: DocumentCardProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  const CardContent = (
    <div className="group cursor-pointer rounded-lg border border-gray-200 bg-white p-4 transition-all duration-200 hover:border-blue-300 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 transition-colors group-hover:text-blue-600">
            {document.name}
          </h4>
          {document.description && (
            <p className="mt-1 line-clamp-2 text-sm text-gray-600">
              {document.description}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              📁 {document.originalFilename}
            </span>
            <span className="flex items-center gap-1">
              📊 {formatFileSize(document.fileSize)}
            </span>
            <span className="flex items-center gap-1">
              📅 {formatDate(document.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              🏷️ {document.contentType}
            </span>
          </div>
        </div>

        {showActions && (
          <div className="ml-4 flex items-center space-x-2">
            {onDownload && (
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDownload(document);
                }}
                disabled={isDownloading}
                className="bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-100 disabled:opacity-50"
              >
                {isDownloading ? "⏳" : "📥"} Download
              </Button>
            )}
            {onDelete && (
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(document.id, document.name);
                }}
                disabled={isDeleting}
                className="bg-red-50 px-3 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
              >
                {isDeleting ? "⏳" : "🗑️"} Delete
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Link to="/slide/$slideId" params={{ slideId: document.id.toString() }}>
      {CardContent}
    </Link>
  );
}
