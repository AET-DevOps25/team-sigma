import React, { useState } from "react";
import {
  HelpCircle,
  CheckCircle,
  XCircle,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { Button } from "../ui/button";
import type { Document, QuizQuestion } from "../../hooks/useApi";
import { useQuizQuestions } from "../../hooks/useApi";

interface QuizTabProps {
  document: Document;
}

const QuizTab: React.FC<QuizTabProps> = ({ document }) => {
  // Fetch quiz questions from the server
  const { data: quizQuestions, isLoading, error } = useQuizQuestions("test");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const handleAnswerSelect = (answerIndex: number) => {
    if (quizCompleted || !quizQuestions) return;

    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (!quizQuestions) return;

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setQuizCompleted(true);
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setShowResults(false);
    setQuizCompleted(false);
  };

  const calculateScore = () => {
    if (!quizQuestions) return 0;

    let correct = 0;
    selectedAnswers.forEach((answer, index) => {
      if (answer === quizQuestions[index].correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Loading quiz questions...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <XCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg font-semibold">Failed to load quiz</h3>
          <p className="mb-4 text-gray-600">
            There was an error loading the quiz questions. Please try again
            later.
          </p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  // No questions available
  if (!quizQuestions || quizQuestions.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center">
          <HelpCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold">No quiz available</h3>
          <p className="text-gray-600">
            No quiz questions are available for this document yet.
          </p>
        </div>
      </div>
    );
  }

  const currentQ = quizQuestions[currentQuestion];
  const score = calculateScore();
  const isAnswerSelected = selectedAnswers[currentQuestion] !== undefined;

  if (showResults) {
    return (
      <div className="p-6">
        <div className="mb-6 text-center">
          <div className="mb-4">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-800">
              Quiz Complete!
            </h3>
            <p className="text-gray-600">
              Here are your results for "{document.name}"
            </p>
          </div>

          <div className="mb-6 rounded-lg bg-gray-50 p-4">
            <div className="mb-1 text-3xl font-bold text-blue-600">
              {score}/{quizQuestions.length}
            </div>
            <div className="text-gray-600">
              {Math.round((score / quizQuestions.length) * 100)}% Correct
            </div>
          </div>
        </div>

        <div className="mb-6 space-y-4">
          {quizQuestions.map((question: QuizQuestion, index: number) => {
            const userAnswer = selectedAnswers[index];
            const isCorrect = userAnswer === question.correctAnswer;

            return (
              <div key={question.id} className="rounded-lg border p-4">
                <div className="mb-3 flex items-start gap-3">
                  <div
                    className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${
                      isCorrect ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    {isCorrect ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="mb-2 font-medium text-gray-800">
                      {index + 1}. {question.question}
                    </h4>
                    <div className="mb-2 text-sm text-gray-600">
                      <span className="font-medium">Your answer:</span>{" "}
                      {question.options[userAnswer]}
                    </div>
                    {!isCorrect && (
                      <div className="mb-2 text-sm text-gray-600">
                        <span className="font-medium">Correct answer:</span>{" "}
                        {question.options[question.correctAnswer]}
                      </div>
                    )}
                    <div className="rounded bg-blue-50 p-2 text-sm text-gray-700">
                      <span className="font-medium">Explanation:</span>{" "}
                      {question.explanation}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Button onClick={handleRestart} className="px-6">
            <RotateCcw className="mr-2 h-4 w-4" />
            Retake Quiz
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center text-lg font-semibold">
            <HelpCircle className="mr-2 h-5 w-5" />
            Quiz
          </h3>
          <div className="text-sm text-gray-500">
            Question {currentQuestion + 1} of {quizQuestions.length}
          </div>
        </div>

        <div className="mb-4 h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-blue-600 transition-all duration-300"
            style={{
              width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="mb-4 text-lg font-medium text-gray-800">
          {currentQ.question}
        </h4>

        <div className="space-y-3">
          {currentQ.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`w-full rounded-lg border-2 p-4 text-left transition-all duration-200 ${
                selectedAnswers[currentQuestion] === index
                  ? "border-blue-500 bg-blue-50 text-blue-800"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`mr-3 flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                    selectedAnswers[currentQuestion] === index
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {selectedAnswers[currentQuestion] === index && (
                    <div className="h-2 w-2 rounded-full bg-white"></div>
                  )}
                </div>
                <span>{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          variant="outline"
        >
          Previous
        </Button>

        <Button onClick={handleNext} disabled={!isAnswerSelected}>
          {currentQuestion === quizQuestions.length - 1
            ? "Finish Quiz"
            : "Next"}
        </Button>
      </div>
    </div>
  );
};

export default QuizTab;
