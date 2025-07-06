import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, User, Bot, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import type { Document, ConversationMessage } from "../../hooks/useApi";
import { useChatMessage, useDocument, useClearDocumentConversation } from "../../hooks/useApi";
import { useQueryClient } from "@tanstack/react-query";
import { Textarea } from "../ui/textarea";

interface ChatTabProps {
  document: Document;
}

const ChatTab: React.FC<ChatTabProps> = ({ document }) => {
  const [inputValue, setInputValue] = useState("");
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const queryClient = useQueryClient();
  const chatMutation = useChatMessage();
  const clearConversationMutation = useClearDocumentConversation();
  
  const { data: updatedDocument, isLoading } = useDocument(document.id);
  const conversation = updatedDocument?.conversation || document.conversation || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.length, isWaitingForResponse]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isWaitingForResponse) return;

    const userMessageContent = inputValue.trim();
    setInputValue("");
    setIsWaitingForResponse(true);

    const optimisticUserMessage: ConversationMessage = {
      messageIndex: conversation.length,
      messageType: 'HUMAN',
      content: userMessageContent,
      createdAt: new Date().toISOString()
    };

    queryClient.setQueryData(['documents', document.id], (oldData: Document | undefined) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        conversation: [...(oldData.conversation || []), optimisticUserMessage]
      };
    });

    try {
      const chatResponse = await chatMutation.mutateAsync({
        message: userMessageContent,
        document_id: document.id.toString()
      });

      console.log("chatResponse", chatResponse);

      if (chatResponse.document) {
        queryClient.setQueryData(['documents', document.id], chatResponse.document);
      }

    } catch (error) {
      console.error('Chat service error:', error);
      queryClient.setQueryData(['documents', document.id], (oldData: Document | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          conversation: oldData.conversation?.slice(0, -1) || []
        };
      });
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

  const handleClearConversation = () => {
    clearConversationMutation.mutate(document.id);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <MessageSquare className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="font-semibold text-gray-800">Chat about {document.name}</h3>
          </div>
          <Button
            onClick={handleClearConversation}
            variant="outline"
            size="sm"
            disabled={clearConversationMutation.isPending || conversation.length === 0}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            New Chat
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p>Loading conversation...</p>
            </div>
          </div>
        ) : conversation.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Start a conversation about "{document.name}"</p>
              <p className="text-sm mt-1">Ask any questions about the document content</p>
            </div>
          </div>
        ) : (
          conversation.map((message: ConversationMessage, index: number) => (
            <div
              key={index}
              className={`flex ${message.messageType === 'HUMAN' ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.messageType === 'HUMAN'
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0">
                    {message.messageType === 'HUMAN' ? (
                      <User className="h-4 w-4 mt-0.5" />
                    ) : (
                      <Bot className="h-4 w-4 mt-0.5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.messageType === 'HUMAN' ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleTimeString()}
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
        
        <div ref={messagesEndRef} />
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