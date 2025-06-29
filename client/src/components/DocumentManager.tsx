import React, { useState } from 'react';
import {
  useDocuments,
  useDocumentSearch,
  useSimilarDocuments,
  useUploadDocument,
  useDeleteDocument,
  useDocumentDownload,
  useGatewayHealth,
  type Document,
  type DocumentUploadRequest,
} from '../hooks/useApi';

export function DocumentManager() {
  // State for forms and UI
  const [searchQuery, setSearchQuery] = useState('');
  const [similarQuery, setSimilarQuery] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'search' | 'similar' | 'upload'>('list');

  // API hooks
  const { data: gatewayHealth } = useGatewayHealth();
  const { data: documents, isLoading: documentsLoading, error: documentsError } = useDocuments();
  const { data: searchResults, isLoading: searchLoading } = useDocumentSearch(searchQuery);
  const { data: similarResults, isLoading: similarLoading } = useSimilarDocuments(similarQuery);
  
  // Mutations
  const uploadMutation = useUploadDocument();
  const deleteMutation = useDeleteDocument();
  const { downloadDocument, isDownloading } = useDocumentDownload();

  // Handle file upload
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadFile || !uploadName.trim()) {
      alert('Please select a file and provide a name');
      return;
    }

    const metadata: DocumentUploadRequest = {
      name: uploadName.trim(),
      description: uploadDescription.trim() || undefined,
      lectureId: "mock-id",
    };

    try {
      await uploadMutation.mutateAsync({ file: uploadFile, metadata });
      
      // Reset form
      setUploadFile(null);
      setUploadName('');
      setUploadDescription('');
      
      // Switch to list tab to see the uploaded document
      setActiveTab('list');
      
      alert('Document uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    }
  };

  // Handle file deletion
  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await deleteMutation.mutateAsync(id);
      alert('Document deleted successfully!');
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Delete failed. Please try again.');
    }
  };

  // Handle file download
  const handleDownload = async (doc: Document) => {
    try {
      await downloadDocument(doc.id, doc.originalFilename);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  // Document list component
  const DocumentList: React.FC<{ documents: Document[]; title: string; loading?: boolean }> = ({ 
    documents, 
    title, 
    loading 
  }) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      
      {loading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No documents found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{doc.name}</h4>
                  {doc.description && (
                    <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                  )}
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>📁 {doc.originalFilename}</span>
                    <span>📊 {formatFileSize(doc.fileSize)}</span>
                    <span>📅 {formatDate(doc.createdAt)}</span>
                    <span>🏷️ {doc.contentType}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleDownload(doc)}
                    disabled={isDownloading}
                    className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 disabled:opacity-50"
                  >
                    {isDownloading ? '⏳' : '📥'} Download
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id, doc.name)}
                    disabled={deleteMutation.isPending}
                    className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 disabled:opacity-50"
                  >
                    {deleteMutation.isPending ? '⏳' : '🗑️'} Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📄 Document Management System
          </h1>
          <p className="text-xl text-gray-600">
            React Query integration with microservices routing
          </p>
        </div>

        {/* Status Banner */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">System Status</h2>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-sm text-gray-600">
                    Gateway: {gatewayHealth?.status || 'Connected'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-sm text-gray-600">
                    Document Service: {documentsError ? 'Error' : 'Connected'}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">
                {documents?.length || 0}
              </p>
              <p className="text-sm text-gray-600">Documents</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'list', label: '📋 All Documents', count: documents?.length },
                { key: 'search', label: '🔍 Search', count: searchResults?.length },
                { key: 'similar', label: '🎯 Similar', count: similarResults?.length },
                { key: 'upload', label: '📤 Upload' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as 'list' | 'search' | 'similar' | 'upload')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* All Documents Tab */}
            {activeTab === 'list' && (
              <DocumentList 
                documents={documents || []} 
                title="All Documents" 
                loading={documentsLoading}
              />
            )}

            {/* Search Tab */}
            {activeTab === 'search' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Documents
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Enter search terms..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => setSearchQuery('')}
                      className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                
                {searchQuery && (
                  <DocumentList 
                    documents={searchResults || []} 
                    title={`Search Results for "${searchQuery}"`}
                    loading={searchLoading}
                  />
                )}
              </div>
            )}

            {/* Similar Documents Tab */}
            {activeTab === 'similar' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Find Similar Documents (Vector Search)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={similarQuery}
                      onChange={(e) => setSimilarQuery(e.target.value)}
                      placeholder="Describe what you're looking for..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => setSimilarQuery('')}
                      className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Clear
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Uses AI-powered vector similarity search to find semantically related documents
                  </p>
                </div>
                
                {similarQuery && (
                  <DocumentList 
                    documents={similarResults || []} 
                    title={`Similar Documents for "${similarQuery}"`}
                    loading={similarLoading}
                  />
                )}
              </div>
            )}

            {/* Upload Tab */}
            {activeTab === 'upload' && (
              <form onSubmit={handleUpload} className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800">Upload New Document</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select File *
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Name *
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
              </form>
            )}
          </div>
        </div>

        {/* Architecture Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            🏗️ React Query Integration
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Gateway Endpoints</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✅ Health monitoring with React Query</li>
                <li>✅ Service discovery endpoints</li>
                <li>✅ Proper error handling and caching</li>
                <li>✅ Loading states and optimistic updates</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Document Service API</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✅ Full CRUD operations via gateway routing</li>
                <li>✅ File upload with multipart/form-data</li>
                <li>✅ Text search and vector similarity</li>
                <li>✅ Download with proper file handling</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 