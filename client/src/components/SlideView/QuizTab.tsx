import React from "react";
import { HelpCircle } from "lucide-react";

const QuizTab: React.FC = () => {
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
};

export default QuizTab; 