import { useState } from "react";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { ArrowLeft, FileText, MessageSquare, HelpCircle, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from "../../components/ui/button";
import { Link } from "@tanstack/react-router";
import SummaryTab from "../../components/SlideView/SummaryTab";
import QuizTab from "../../components/SlideView/QuizTab";
import ChatTab from "../../components/SlideView/ChatTab";
import { useDocument, getDocumentPdfUrl } from "../../hooks/useApi";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export const Route = createFileRoute("/_authed/slide/$slideId")({
  component: SlideView,
});

function SlideView() {
  const { slideId } = useParams({ from: "/_authed/slide/$slideId" });
  const [activeTab, setActiveTab] = useState<"summary" | "quiz" | "chat">("summary");
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageLoading, setPageLoading] = useState<boolean>(false);

  const { data: document, isLoading, error } = useDocument(parseInt(slideId));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-500">Loading document...</p>
        </div>
      </div>    
    );
  }

  if (error || !document) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Document not found</h2>
          <p className="text-gray-600 mb-4">The requested document could not be found.</p>
          <Link to="/">
            <Button>Go back</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Generate PDF URL using the API helper
  const pdfUrl = getDocumentPdfUrl(document.id);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const onPageLoadSuccess = () => {
    setPageLoading(false);
  };

  const onPageRenderError = () => {
    setPageLoading(false);
  };

  const goToPrevPage = () => {
    if (pageNumber > 1) {
      setPageLoading(true);
      setPageNumber(page => Math.max(1, page - 1));
    }
  };

  const goToNextPage = () => {
    if (pageNumber < numPages) {
      setPageLoading(true);
      setPageNumber(page => Math.min(numPages, page + 1));
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "summary":
        return <SummaryTab document={document} />;
      case "quiz":
        return <QuizTab document={document} />;
      case "chat":
        return <ChatTab document={document} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-500" />
            <h1 className="text-xl font-bold text-gray-800">{document.name}</h1>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden p-6 gap-6">
        <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col">
          <div className="flex-1 bg-gray-100 rounded-lg shadow-inner flex items-center justify-center overflow-hidden m-4 relative">
            {pageLoading && (
              <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center z-10">
                <p className="text-gray-500">Loading page...</p>
              </div>
            )}
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Loading PDF...</p>
                </div>
              }
              error={
                <div className="flex items-center justify-center h-full">
                  <p className="text-red-500">Failed to load PDF</p>
                </div>
              }
              options={{
                cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
                cMapPacked: true,
                standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/standard_fonts/',
              }}
            >
              <Page
                key={`page_${pageNumber}`}
                pageNumber={pageNumber}
                width={Math.min(800, window.innerWidth * 0.6)}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                onLoadSuccess={onPageLoadSuccess}
                onRenderError={onPageRenderError}
                loading={
                  <div className="flex items-center justify-center h-full min-h-[600px]">
                    <p className="text-gray-500">Loading page {pageNumber}...</p>
                  </div>
                }
                error={
                  <div className="flex items-center justify-center h-full min-h-[600px]">
                    <p className="text-red-500">Failed to load page {pageNumber}</p>
                  </div>
                }
              />
            </Document>
          </div>
          
          {numPages > 0 && (
            <div className="flex items-center justify-center gap-4 p-4 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPrevPage}
                disabled={pageNumber <= 1 || pageLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600">
                Page {pageNumber} of {numPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={pageNumber >= numPages || pageLoading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="w-[480px] bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col">
          <div className="border-b border-gray-200 rounded-t-lg">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("summary")}
                className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors first:rounded-tl-lg ${
                  activeTab === "summary"
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <BookOpen className="h-4 w-4 mx-auto mb-1" />
                Summary
              </button>
              <button
                onClick={() => setActiveTab("quiz")}
                className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "quiz"
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <HelpCircle className="h-4 w-4 mx-auto mb-1" />
                Quiz
              </button>
              <button
                onClick={() => setActiveTab("chat")}
                className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors last:rounded-tr-lg ${
                  activeTab === "chat"
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <MessageSquare className="h-4 w-4 mx-auto mb-1" />
                Chat
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-auto rounded-b-lg">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
} 