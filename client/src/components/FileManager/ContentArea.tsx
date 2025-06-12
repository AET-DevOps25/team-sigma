import React, { useEffect, useState } from "react";
import { X, FileText, Clock, Layers } from "lucide-react";
import { Button } from "../ui/button";
import { OrganizationProfile, useOrganization } from "@clerk/clerk-react";
import { mockSlideDecks } from "../../models";
import type { SlideDeck } from "../../models";

const ContentArea: React.FC = () => {
  const { membership, organization } = useOrganization();
  const [showOrgEditPanel, setShowOrgEditPanel] = useState(false);
  const [slideDecks, setSlideDecks] = useState<SlideDeck[]>([]);

  useEffect(() => {
    const handleToggleOrgEdit = () => {
      setShowOrgEditPanel(prev => !prev);
    };

    window.addEventListener('toggle-org-edit', handleToggleOrgEdit);
    
    return () => {
      window.removeEventListener('toggle-org-edit', handleToggleOrgEdit);
    };
  }, []);

  useEffect(() => {
    if (organization?.id) {
      // In a real app, we would fetch slides from an API using the organization ID
      
      // This is the filtering logic that would be used in a real app
      // const orgSlides = mockSlideDecks.filter(deck => deck.organizationId === organization.id);
      
      // For now, show all slides for every organization
      const orgSlides = mockSlideDecks;
      
      setSlideDecks(orgSlides);
    } else {
      setSlideDecks([]);
    }
  }, [organization?.id]);

  // Format date to relative time (e.g., "2 days ago")
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  return (
    <div className="relative flex flex-col w-full h-full">
      {/* Slide-down panel */}
      {showOrgEditPanel && (
        <div className="absolute top-0 right-0 left-0 z-50 border-b border-gray-200 bg-white p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Edit Lecture</h2>
            <Button variant="ghost" onClick={() => setShowOrgEditPanel(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <OrganizationProfile />
        </div>
      )}

      <div className="flex-1 bg-gray-50 p-6 h-full overflow-auto">
        {organization?.name ? (
          <div className="h-full">
            <h2 className="text-xl font-semibold mb-6">{organization.name} Materials</h2>
            
            {slideDecks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {slideDecks.map((deck) => (
                  <div 
                    key={deck.id} 
                    className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden flex flex-col"
                  >
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex items-center mb-3">
                        <FileText className="h-5 w-5 text-blue-500 mr-2" />
                        <h3 className="font-medium text-lg text-gray-800">{deck.title}</h3>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{formatRelativeTime(deck.uploadedAt)}</span>
                        </div>
                        {deck.slideCount && (
                          <div className="flex items-center">
                            <Layers className="h-4 w-4 mr-1" />
                            <span>{deck.slideCount} slides</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                      <Button variant="ghost" size="sm" className="text-blue-600 w-full">
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg p-8 text-center">
                <FileText className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">No slide decks yet</h3>
                <p className="text-gray-500">Upload materials to get started</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-400">Select a lecture to view its materials</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentArea;
