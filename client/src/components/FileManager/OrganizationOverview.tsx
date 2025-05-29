import React from 'react';
import { Sidebar, SidebarContent, SidebarHeader } from '../ui/sidebar';
import { useOrganizationList } from '@clerk/clerk-react';
import { Button } from '../ui/button';
import { FolderPlus, LoaderIcon } from 'lucide-react';

interface OrganizationOverviewProps {
  showCreateOrgDialog: boolean;
  setShowCreateOrgDialog: (newValue: boolean) => void;
  selectedOrganisationId: string | null;
  setSelectedOrganisation: (id: string, name: string) => void;
}

const OrganizationOverview: React.FC<OrganizationOverviewProps> = ({
  showCreateOrgDialog,
  setShowCreateOrgDialog,
  selectedOrganisationId,
  setSelectedOrganisation,
}) => {
  const { userMemberships, isLoaded } = useOrganizationList({ userMemberships: true });

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-between px-4 py-2">
          <h2 className="text-lg font-semibold text-gray-800">Lectures</h2>
          <Button className="text-sm bg-blue-600" onClick={() => setShowCreateOrgDialog(!showCreateOrgDialog)}>
            <FolderPlus className="w-4 h-4 text-white" />
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
        {!isLoaded && (
          <div className="flex justify-center py-4">
            <LoaderIcon className="animate-spin" />
          </div>
        )}
        {isLoaded && userMemberships.data.length === 0 && (
          <div className="text-sm text-gray-500 px-4 py-2">
            You are not a member of any lectures.
          </div>
        )}
        {isLoaded &&
          userMemberships.data.map((membership) => {
            const isSelected = selectedOrganisationId === membership.organization.id;

            return (
              <div
                key={membership.organization.id}
                className={`mb-2 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${isSelected
                    ? 'bg-blue-100 border-blue-500 text-blue-800'
                    : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-900'
                  }`}
                onClick={() =>
                  setSelectedOrganisation(
                    membership.organization.id,
                    membership.organization.name
                  )
                }
              >
                <div className="text-sm font-medium">{membership.organization.name}</div>
              </div>
            );
          })}
      </SidebarContent>
    </Sidebar>
  );
};

export default OrganizationOverview;