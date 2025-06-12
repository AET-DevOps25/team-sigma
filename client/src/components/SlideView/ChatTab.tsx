import React, { useState, useEffect } from "react";
import { MessageSquare, Send, User, Bot } from "lucide-react";
import { Button } from "../ui/button";
import type { Message, Conversation, SlideDeck } from "../../models";
import { mockConversations } from "../../models";
import { Textarea } from "../ui/textarea";

interface ChatTabProps {
  slideDeck: SlideDeck;
}

const ChatTab: React.FC<ChatTabProps> = ({ slideDeck }) => {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);

  useEffect(() => {
    // Find the conversation for this slide deck
    const existingConversation = mockConversations.find(
      conv => conv.id === slideDeck.conversationId
    );
    
    if (existingConversation) {
      setConversation(existingConversation);
    } else {
      // Create a new conversation if none exists
      const newConversation: Conversation = {
        id: `conv_${slideDeck.id}`,
        slideDeckId: slideDeck.id,
        messages: [
          {
            text: "Hello! I'm here to help you understand this slide deck. Feel free to ask me any questions about the content.",
            isUser: false,
            timestamp: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setConversation(newConversation);
    }
  }, [slideDeck]);

  const handleSendMessage = () => {
    if (inputValue.trim() === "" || !conversation || isWaitingForResponse) return;

    const newMessage: Message = {
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    // Update conversation with new user message
    const updatedConversation = {
      ...conversation,
      messages: [...conversation.messages, newMessage],
      updatedAt: new Date(),
    };
    
    setConversation(updatedConversation);
    setInputValue("");
    setIsWaitingForResponse(true);

    // Simulate AI response after a short delay
    setTimeout(() => {
      const aiResponse: Message = {
        text: "Thanks for your question! This is a placeholder response. In the future, I'll provide detailed answers about the slide content.",
        isUser: false,
        timestamp: new Date(),
      };
      
      const finalConversation = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, aiResponse],
        updatedAt: new Date(),
      };
      
      setConversation(finalConversation);
      setIsWaitingForResponse(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading conversation...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          Chat
        </h3>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start gap-2 ${message.isUser ? "justify-end" : "justify-start"}`}
          >
            {/* AI Avatar - Left side */}
            {!message.isUser && (
              <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-gray-600" />
              </div>
            )}
            
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.isUser
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs opacity-75">
                  {message.isUser ? "You" : "AI Assistant"}
                </span>
              </div>
              <p className="text-sm leading-relaxed break-words overflow-wrap-anywhere">{message.text}</p>
            </div>
            
            {/* User Avatar - Right side */}
            {message.isUser && (
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        ))}
        
        {/* Typing indicator when waiting for AI response */}
        {isWaitingForResponse && (
          <div className="flex items-start gap-2 justify-start">
            {/* AI Avatar */}
            <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <Bot className="h-4 w-4 text-gray-600" />
            </div>
            
            <div className="max-w-[80%] rounded-lg p-3 bg-gray-100 text-gray-800">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs opacity-75">AI Assistant</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-500 ml-2">Typing...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col p-4 border-t border-gray-200">
        <div className="flex gap-2 items-center">
                     <Textarea
             value={inputValue}
             onChange={(e) => setInputValue(e.target.value)}
             onKeyDown={handleKeyPress}
             placeholder={isWaitingForResponse ? "Waiting for AI response..." : "Ask a question about the slides..."}
             disabled={isWaitingForResponse}
             className="flex-1 min-h-[40px] w-full max-h-[100px] px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
             rows={1}
           />
           <Button
             onClick={handleSendMessage}
             disabled={inputValue.trim() === "" || isWaitingForResponse}
             size="sm"
             className="px-3"
           >
             <Send className="h-4 w-4" />
           </Button>
        </div>
                 <p className="text-xs text-gray-500 mt-2">
           {isWaitingForResponse 
             ? "Please wait for the AI to respond before sending another message"
             : "Press Enter to send, Shift+Enter for new line"
           }
         </p>
      </div>
    </div>
  );
};

export default ChatTab; 