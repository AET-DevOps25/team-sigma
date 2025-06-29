import React, { useState } from "react";
import { OrganizationSwitcher, useOrganization } from "@clerk/clerk-react";
import { Button } from "../ui/button";
import { Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../ui/dialog";
import {
  useUploadDocument,
  type DocumentUploadRequest,
} from "../../hooks/useApi";

const AppHeader: React.FC = () => {
  const { organization } = useOrganization();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  
  // API mutations
  const uploadMutation = useUploadDocument();

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!uploadFile || !uploadName.trim()) {
      alert('Please select a file and provide a name');
      return;
    }

    const metadata: DocumentUploadRequest = {
      name: uploadName.trim(),
      description: uploadDescription.trim() || undefined,
      organizationId: organization?.id,
    };

    try {
      await uploadMutation.mutateAsync({ file: uploadFile, metadata });
      
      // Reset form
      setUploadFile(null);
      setUploadName('');
      setUploadDescription('');
      setUploadDialogOpen(false);
      
      alert('Document uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-4 py-3 flex items-center justify-between">
        <OrganizationSwitcher
          hidePersonal
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
          <Button onClick={() => window.dispatchEvent(new CustomEvent('toggle-org-edit'))}>
            Edit lecture
          </Button>
          
          {/* Upload Dialog */}
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Upload className="mr-2 h-4 w-4" />
                Upload Materials
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Upload New Document</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select File <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                        className="sr-only"
                        accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                        required
                      />
                      <span className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Choose File
                      </span>
                    </label>
                    <span className="text-sm text-gray-500">
                      {uploadFile ? uploadFile.name : 'No file chosen'}
                    </span>
                  </div>
                  {uploadFile && (
                    <p className="text-xs text-gray-500 mt-1">
                      Size: {formatFileSize(uploadFile.size)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={uploadName}
                    onChange={(e) => setUploadName(e.target.value)}
                    placeholder="Enter a descriptive name..."
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    placeholder="Add a description to make the document easier to find..."
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <DialogFooter>
                  <button
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
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
};

export default AppHeader; 