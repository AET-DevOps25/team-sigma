import React, { useState, useEffect } from "react";
import { MessageSquare, Send, User, Bot } from "lucide-react";
import { Button } from "../ui/button";
import type { Document } from "../../hooks/useApi";
import { useChatMessage } from "../../hooks/useApi";
import { Textarea } from "../ui/textarea";

interface ConversationMessage {
  messageIndex: number;
  messageType: 'ai' | 'human';
  content: string;
  createdAt: Date;
}

interface ChatTabProps {
  document: Document;
}

const ChatTab: React.FC<ChatTabProps> = ({ document }) => {
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const chatMutation = useChatMessage();

  useEffect(() => {
    setConversation([]);
  }, [document]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isWaitingForResponse) return;

    const userMessage: ConversationMessage = {
      messageIndex: conversation.length,
      messageType: 'human',
      content: inputValue.trim(),
      createdAt: new Date(),
    };

    setConversation(prev => [...prev, userMessage]);
    setInputValue("");
    setIsWaitingForResponse(true);

    try {
      const data = await chatMutation.mutateAsync({
        message: userMessage.content,
        document_id: document.id.toString()
      });

      const aiResponse: ConversationMessage = {
        messageIndex: conversation.length + 1,
        messageType: 'ai',
        content: data.response,
        createdAt: new Date(),
      };

      setConversation(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Chat service error:', error);
      const aiResponse: ConversationMessage = {
        messageIndex: conversation.length + 1,
        messageType: 'ai',
        content: `Sorry, I'm having trouble connecting to the chat service. This is a fallback response for your question: "${userMessage.content}"`,
        createdAt: new Date(),
      };

      setConversation(prev => [...prev, aiResponse]);
    } finally {
      setIsWaitingForResponse(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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
        {conversation.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Start a conversation about "{document.name}"</p>
              <p className="text-sm mt-1">Ask any questions about the document content</p>
            </div>
          </div>
        ) : (
          conversation.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.messageType === 'human' ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.messageType === 'human'
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0">
                    {message.messageType === 'human' ? (
                      <User className="h-4 w-4 mt-0.5" />
                    ) : (
                      <Bot className="h-4 w-4 mt-0.5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.messageType === 'human' ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      {message.createdAt.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        
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
            onKeyDown={handleKeyPress}
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