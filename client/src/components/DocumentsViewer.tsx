import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import {
  useDocuments,
  useUploadDocument,
  useDeleteDocument,
  useDocumentDownload,
  useUpdateDocument,
  type Lecture,
  type DocumentUploadRequest,
  type Document,
} from '../hooks/useApi';

import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { ConfirmDialog } from './ui/confirm-dialog';
import { DocumentListCard } from './DocumentListCard';

interface DocumentsViewerProps {
  selectedLecture: Lecture;
  onBack: () => void;
}

export function DocumentsViewer({ selectedLecture, onBack }: DocumentsViewerProps) {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<{ id: number; name: string } | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const { data: documents, isLoading: documentsLoading, error: documentsError } = useDocuments(selectedLecture.id.toString());
  const uploadMutation = useUploadDocument();
  const updateMutation = useUpdateDocument();
  const deleteMutation = useDeleteDocument();
  const { downloadDocument, isDownloading } = useDocumentDownload();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadFile || !uploadName.trim()) {
      toast.error('Please select a file and provide a name');
      return;
    }

    const metadata: DocumentUploadRequest = {
      name: uploadName.trim(),
      description: uploadDescription.trim() || undefined,
      lectureId: selectedLecture.id.toString(),
    };

    try {
      await uploadMutation.mutateAsync({ file: uploadFile, metadata });
      
      setUploadFile(null);
      setUploadName('');
      setUploadDescription('');
      setShowUploadForm(false);
      
      toast.success('Document uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Upload failed. Please try again.');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!editingDocument || !editName.trim()) {
      return;
    }

    const metadata: DocumentUploadRequest = {
      name: editName.trim(),
      description: editDescription.trim() || undefined,
      lectureId: selectedLecture.id.toString(),
    };

    try {
      await updateMutation.mutateAsync({ id: editingDocument.id, metadata });

      setEditingDocument(null);
      setEditName('');
      setEditDescription('');

      toast.success('Document updated successfully!');
    } catch (error) {
      console.error('Update failed:', error);
      toast.error('Update failed. Please try again.');
    }
  };

  const startEdit = (doc: Document) => {
    setEditingDocument(doc);
    setEditName(doc.name);
    setEditDescription(doc.description || '');
  };

  const cancelEdit = () => {
    setEditingDocument(null);
    setEditName('');
    setEditDescription('');
  };

  const handleDelete = (id: number, name: string) => {
    setDocumentToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!documentToDelete) return;

    try {
      await deleteMutation.mutateAsync(documentToDelete.id);
      toast.success('Document deleted successfully!');
      setDocumentToDelete(null);
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Delete failed. Please try again.');
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      await downloadDocument(doc.id, doc.originalFilename);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Download failed. Please try again.');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={onBack}
            >
              ← Back
            </Button>
            <h2 className="text-xl font-semibold text-gray-800">{selectedLecture.name}</h2>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-gray-50 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Slides</h3>
              <Button
                onClick={() => setShowUploadForm(!showUploadForm)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                {showUploadForm ? 'Cancel Upload' : '📤 Upload Document'}
              </Button>
            </div>

            {showUploadForm && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <form onSubmit={handleUpload} className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-800">Upload New Document</h4>
                  
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Select File *
                    </Label>
                    <Input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setUploadFile(file);
                        if (file) {
                          const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, '');
                          setUploadName(nameWithoutExtension);
                          setTimeout(() => {
                            nameInputRef.current?.select();
                          }, 0);
                        }
                      }}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      required
                    />
                    {uploadFile && (
                      <p className="text-xs text-gray-500 mt-1">
                        Selected: {uploadFile.name} ({formatFileSize(uploadFile.size)})
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Document Name *
                    </Label>
                    <Input
                      ref={nameInputRef}
                      type="text"
                      value={uploadName}
                      onChange={(e) => setUploadName(e.target.value)}
                      placeholder="Enter a descriptive name..."
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (Optional)
                    </Label>
                    <Textarea
                      value={uploadDescription}
                      onChange={(e) => setUploadDescription(e.target.value)}
                      placeholder="Add a description to make the document easier to find..."
                      rows={3}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={uploadMutation.isPending || !uploadFile || !uploadName.trim()}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadMutation.isPending ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Uploading...
                      </>
                    ) : (
                      <>
                        📤 Upload Document
                      </>
                    )}
                  </Button>
                </form>
              </div>
            )}
            
            {documentsLoading ? (
              <div className="animate-pulse space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            ) : documentsError ? (
              <div className="text-center py-8 text-gray-500">
                <p>Error loading documents. Please try again later.</p>
              </div>
            ) : documents && documents.length > 0 ? (
              <div className="grid gap-4">
                {documents.map((doc) => (
                  <DocumentListCard
                    key={doc.id}
                    doc={doc}
                    editingDocument={editingDocument}
                    editName={editName}
                    editDescription={editDescription}
                    onNameChange={setEditName}
                    onDescriptionChange={setEditDescription}
                    onSave={handleUpdate}
                    onCancel={cancelEdit}
                    onStartEdit={startEdit}
                    onDownload={handleDownload}
                    onDelete={handleDelete}
                    isUpdating={updateMutation.isPending}
                    isDownloading={isDownloading}
                    isDeleting={deleteMutation.isPending}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No documents found for this lecture</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Document"
        description={`Are you sure you want to delete "${documentToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        destructive={true}
      />
    </div>
  );
} 