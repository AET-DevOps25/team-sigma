import React from "react";
import { BookOpen } from "lucide-react";
import type { SlideDeck } from "../../models";

interface SummaryTabProps {
  slideDeck: SlideDeck;
}

const SummaryTab: React.FC<SummaryTabProps> = ({ slideDeck }) => {
  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <BookOpen className="h-5 w-5 mr-2" />
        Summary
      </h3>
      <p className="text-gray-700 leading-relaxed">{slideDeck.summary}</p>
    </div>
  );
};

export default SummaryTab; 