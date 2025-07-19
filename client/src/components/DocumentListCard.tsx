import React from 'react';
import { Button } from './ui/button';
import { DocumentEditForm } from './DocumentEditForm';
import type { Document } from '../hooks/useApi';

interface DocumentListCardProps {
  doc: Document;
  editingDocument: Document | null;
  editName: string;
  editDescription: string;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  onSave: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
  onStartEdit: (doc: Document) => void;
  onDownload: (doc: Document) => Promise<void>;
  onDelete: (id: number, name: string) => void;
  isUpdating: boolean;
  isDownloading: boolean;
  isDeleting: boolean;
}

export function DocumentListCard({
  doc,
  editingDocument,
  editName,
  editDescription,
  onNameChange,
  onDescriptionChange,
  onSave,
  onCancel,
  onStartEdit,
  onDownload,
  onDelete,
  isUpdating,
  isDownloading,
  isDeleting,
}: DocumentListCardProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="group cursor-pointer rounded-lg border border-gray-200 bg-white p-4 transition-all duration-200 hover:border-blue-300 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {editingDocument?.id === doc.id ? (
            <DocumentEditForm
              editName={editName}
              editDescription={editDescription}
              onNameChange={onNameChange}
              onDescriptionChange={onDescriptionChange}
              onSave={onSave}
              onCancel={onCancel}
              isLoading={isUpdating}
            />
          ) : (
            <div 
              onClick={() => window.location.href = `/slide/${doc.id}`}
              className="cursor-pointer"
            >
              <h4 className="font-medium text-gray-900 transition-colors group-hover:text-blue-600">
                {doc.name}
              </h4>
              {doc.description && (
                <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                  {doc.description}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  📁 {doc.originalFilename}
                </span>
                <span className="flex items-center gap-1">
                  📊 {formatFileSize(doc.fileSize)}
                </span>
                <span className="flex items-center gap-1">
                  📅 {formatDate(doc.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  🏷️ {doc.contentType}
                </span>
              </div>
            </div>
          )}
        </div>

        {editingDocument?.id !== doc.id && (
          <div className="ml-4 flex items-center space-x-2">
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onStartEdit(doc);
              }}
              className="bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-100"
            >
              ✏️ Edit
            </Button>
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDownload(doc);
              }}
              disabled={isDownloading}
              className="bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-100 disabled:opacity-50"
            >
              {isDownloading ? "⏳" : "📥"} Download
            </Button>
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(doc.id, doc.name);
              }}
              disabled={isDeleting}
              className="bg-red-50 px-3 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
            >
              {isDeleting ? "⏳" : "🗑️"} Delete
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 