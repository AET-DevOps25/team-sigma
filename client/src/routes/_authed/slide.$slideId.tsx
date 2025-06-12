import React, { useState } from "react";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { ArrowLeft, FileText, MessageSquare, HelpCircle, BookOpen } from "lucide-react";
import { Button } from "../../components/ui/button";
import { mockSlideDecks } from "../../models";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/slide/$slideId")({
  component: SlideView,
});

function SlideView() {
  const { slideId } = useParams({ from: "/_authed/slide/$slideId" });
  const [activeTab, setActiveTab] = useState<"summary" | "quiz" | "chat">("summary");

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

  const renderTabContent = () => {
    switch (activeTab) {
      case "summary":
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Summary
            </h3>
            <p className="text-gray-700 leading-relaxed">{slideDeck.summary}</p>
          </div>
        );
      case "quiz":
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <HelpCircle className="h-5 w-5 mr-2" />
              Quiz
            </h3>
            <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No quiz questions created yet</p>
            </div>
          </div>
        );
      case "chat":
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Chat
            </h3>
            <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
              <p className="text-gray-500">TODO</p>
            </div>
          </div>
        );
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

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side - PDF Viewer */}
        <div className="flex-1 bg-white border-r border-gray-200 p-6">
          <div className="h-full bg-gray-100 rounded-lg shadow-inner">
            <iframe
              src="/mock_slides/mock1.pdf"
              width="100%"
              height="100%"
              className="border-0 rounded-lg"
              title={slideDeck.title}
            />
          </div>
        </div>

        {/* Right Side - Tabs */}
        <div className="w-96 bg-white flex flex-col">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("summary")}
                className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
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
                className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
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
          <div className="flex-1 overflow-auto">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
} 