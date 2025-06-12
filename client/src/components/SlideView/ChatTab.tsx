import React, { useState, useEffect } from "react";
import { MessageSquare, Send, User, Bot } from "lucide-react";
import { Button } from "../ui/button";
import type { Message, Conversation, SlideDeck } from "../../models";
import { mockConversations } from "../../models";

interface ChatTabProps {
  slideDeck: SlideDeck;
}

const ChatTab: React.FC<ChatTabProps> = ({ slideDeck }) => {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [inputValue, setInputValue] = useState("");

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
    if (inputValue.trim() === "" || !conversation) return;

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
            className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.isUser
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {message.isUser ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
                <span className="text-xs opacity-75">
                  {message.isUser ? "You" : "AI Assistant"}
                </span>
              </div>
              <p className="text-sm leading-relaxed">{message.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about the slides..."
            className="flex-1 min-h-[40px] max-h-[100px] px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={1}
          />
          <Button
            onClick={handleSendMessage}
            disabled={inputValue.trim() === ""}
            size="sm"
            className="px-3"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default ChatTab; 