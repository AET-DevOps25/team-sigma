import React, { useState, useEffect } from "react";
import { MessageSquare, Send, User, Bot } from "lucide-react";
import { Button } from "../ui/button";
import type { Message, Conversation } from "../../models";
import type { Document } from "../../hooks/useApi";
import { Textarea } from "../ui/textarea";

interface ChatTabProps {
  document: Document;
}

const ChatTab: React.FC<ChatTabProps> = ({ document }) => {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);

  useEffect(() => {
    const newConversation: Conversation = {
      id: `conv_${document.id}`,
      slideDeckId: document.id.toString(),
      messages: [
        {
          text: `Hello! I'm here to help you understand "${document.name}". Feel free to ask me any questions about the content.`,
          isUser: false,
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setConversation(newConversation);
  }, [document]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !conversation || isWaitingForResponse) return;

    const userMessage: Message = {
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    // Add user message to conversation
    const updatedConversation = {
      ...conversation,
      messages: [...conversation.messages, userMessage],
      updatedAt: new Date(),
    };
    setConversation(updatedConversation);
    setInputValue("");
    setIsWaitingForResponse(true);

    // Simulate AI response (replace with actual API call later)
    setTimeout(() => {
      const aiResponse: Message = {
        text: `I understand you're asking about "${userMessage.text}". Based on the document "${document.name}", I can help you explore this topic. This is a simulated response - in the future, this will connect to a real AI service to analyze the document content.`,
        isUser: false,
        timestamp: new Date(),
      };

      setConversation(prev => prev ? {
        ...prev,
        messages: [...prev.messages, aiResponse],
        updatedAt: new Date(),
      } : null);
      setIsWaitingForResponse(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading chat...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <MessageSquare className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="font-semibold text-gray-800">Chat about {document.name}</h3>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.isUser
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0">
                  {message.isUser ? (
                    <User className="h-4 w-4 mt-0.5" />
                  ) : (
                    <Bot className="h-4 w-4 mt-0.5" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm">{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.isUser ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {isWaitingForResponse && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 rounded-lg p-3 max-w-[80%]">
              <div className="flex items-center space-x-2">
                <Bot className="h-4 w-4" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about this document..."
            className="flex-1 resize-none"
            rows={2}
            disabled={isWaitingForResponse}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isWaitingForResponse}
            size="sm"
            className="self-end"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatTab; 