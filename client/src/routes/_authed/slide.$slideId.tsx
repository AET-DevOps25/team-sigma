import { useState } from "react";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { ArrowLeft, FileText, MessageSquare, HelpCircle, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from "../../components/ui/button";
import { mockSlideDecks } from "../../models";
import { Link } from "@tanstack/react-router";
import SummaryTab from "../../components/SlideView/SummaryTab";
import QuizTab from "../../components/SlideView/QuizTab";
import ChatTab from "../../components/SlideView/ChatTab";

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

  const slideDeck = mockSlideDecks.find(deck => deck.id === slideId);

  if (!slideDeck) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Slide deck not found</h2>
          <Link to="/">
            <Button>Go back</Button>
          </Link>
        </div>
      </div>
    );
  }

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const goToPrevPage = () => {
    setPageNumber(page => Math.max(1, page - 1));
  };

  const goToNextPage = () => {
    setPageNumber(page => Math.min(numPages, page + 1));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "summary":
        return <SummaryTab slideDeck={slideDeck} />;
      case "quiz":
        return <QuizTab />;
      case "chat":
        return <ChatTab slideDeck={slideDeck} />;
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
            <h1 className="text-xl font-bold text-gray-800">{slideDeck.title}</h1>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden p-6 gap-6">
        <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col">
          <div className="flex-1 bg-gray-100 rounded-lg shadow-inner flex items-center justify-center overflow-hidden m-4">
            <Document
              file="/mock_slides/mock1.pdf"
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
            >
              <Page
                pageNumber={pageNumber}
                width={Math.min(800, window.innerWidth * 0.6)}
                renderTextLayer={true}
                renderAnnotationLayer={false}
              />
            </Document>
          </div>
          
          {numPages > 0 && (
            <div className="flex items-center justify-center gap-4 p-4 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPrevPage}
                disabled={pageNumber <= 1}
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
                disabled={pageNumber >= numPages}
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