import React, { useEffect, useState } from "react";
import { BookOpen, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { Document } from "../../hooks/useApi";
import { useGenerateSummary, useSummaryHealth } from "../../hooks/useApi";
import { useQueryClient } from "@tanstack/react-query";

interface SummaryTabProps {
  document: Document;
}

const SummaryTab: React.FC<SummaryTabProps> = ({ document }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();
  const generateSummaryMutation = useGenerateSummary();
  const { data: summaryHealth, isLoading: isHealthLoading, error: healthError } = useSummaryHealth();

  const isSummaryServiceAvailable = summaryHealth?.status === 'healthy' && !healthError;
  
  const cachedSummary = queryClient.getQueryData<string>(['summary', document.id]);
  const [summary, setSummary] = useState<string | null>(cachedSummary || null);

  const handleGenerateSummary = async () => {
    if (!document.id || !isSummaryServiceAvailable) return;

    setIsGenerating(true);
    try {
      const result = await generateSummaryMutation.mutateAsync({
        document_id: document.id.toString()
      });
      
      queryClient.setQueryData(['summary', document.id], result.summary);
      setSummary(result.summary);
    } catch (error) {
      console.error('Failed to generate summary:', error);
      const errorMessage = 'Failed to generate summary. Please try again.';
      setSummary(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (cachedSummary) {
      setSummary(cachedSummary);
      return;
    }
    
    if (document.id && isSummaryServiceAvailable && !cachedSummary) {
      handleGenerateSummary();
    }
  }, [document.id, isSummaryServiceAvailable, cachedSummary]);


  if (isHealthLoading || !isSummaryServiceAvailable) {
    return (
      <div className="p-6">
        <div className="flex flex-row items-end justify-between mb-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            AI Summary
          </h3>
        </div>
        
        <div className="flex items-center justify-center h-32">
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading summary...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <BookOpen className="h-5 w-5 mr-2" />
        AI Summary
      </h3>

      <div>
        {isGenerating ? (
          <div className="flex items-center gap-2 text-gray-600">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Generating summary...</span>
          </div>
        ) : summary ? (
          <div className="text-gray-800 leading-relaxed">
            <ReactMarkdown
              components={{
                h1: ({children}) => <h1 className="text-2xl font-bold mb-4 text-gray-900">{children}</h1>,
                h2: ({children}) => <h2 className="text-xl font-bold mb-3 mt-6 text-gray-900">{children}</h2>,
                h3: ({children}) => <h3 className="text-lg font-semibold mb-2 mt-4 text-gray-900">{children}</h3>,
                h4: ({children}) => <h4 className="text-base font-semibold mb-2 mt-3 text-gray-900">{children}</h4>,
                p: ({children}) => <p className="mb-4 text-gray-800">{children}</p>,
                ul: ({children}) => <ul className="mb-4 ml-6 list-disc space-y-2">{children}</ul>,
                ol: ({children}) => <ol className="mb-4 ml-6 list-decimal space-y-2">{children}</ol>,
                li: ({children}) => <li className="text-gray-800">{children}</li>,
                strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
                em: ({children}) => <em className="italic text-gray-800">{children}</em>,
                blockquote: ({children}) => <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-700 my-4">{children}</blockquote>,
                code: ({children}) => <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">{children}</code>,
                pre: ({children}) => <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4">{children}</pre>,
              }}
            >
              {summary}
            </ReactMarkdown>
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