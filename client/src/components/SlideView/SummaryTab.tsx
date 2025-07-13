import React, { useEffect, useState } from "react";
import { BookOpen, RefreshCw, AlertCircle } from "lucide-react";
import type { Document } from "../../hooks/useApi";
import { useGenerateSummary } from "../../hooks/useApi";
import { Button } from "../ui/button";

interface SummaryTabProps {
  document: Document;
}

const SummaryTab: React.FC<SummaryTabProps> = ({ document }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const generateSummaryMutation = useGenerateSummary();

  const handleGenerateSummary = async () => {
    if (!document.id) return;

    setIsGenerating(true);
    try {
      const result = await generateSummaryMutation.mutateAsync({
        document_id: document.id.toString()
      });
      setSummary(result.summary);
    } catch (error) {
      console.error('Failed to generate summary:', error);
      setSummary('Failed to generate summary. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (document.id) {
      handleGenerateSummary();
    }
  }, [document.id]);

  const handleRefreshSummary = () => {
    setSummary(null);
    handleGenerateSummary();
  };

  return (
    <div className="p-6">
      <div className="flex flex-row items-end justify-between mb-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <BookOpen className="h-5 w-5 mr-2" />
          AI Summary
        </h3>
        <Button
          onClick={handleRefreshSummary}
          disabled={isGenerating}
          className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Generating...' : 'Refresh'}
        </Button>
      </div>

      <div>
        {isGenerating ? (
          <div className="flex items-center gap-2 text-gray-600">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Generating summary...</span>
          </div>
        ) : summary ? (
          <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
            {summary}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-500">
            <AlertCircle className="h-4 w-4" />
            <span>No summary available</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryTab; 