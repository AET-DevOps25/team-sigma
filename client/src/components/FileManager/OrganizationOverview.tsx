import React from 'react';
import { Sidebar, SidebarContent, SidebarHeader } from '../ui/sidebar';
import { OrganizationSwitcher } from '@clerk/clerk-react';

const OrganizationOverview: React.FC = () => {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-between px-4 py-2">
          <h2 className="text-lg font-semibold text-gray-800">Lectures</h2>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-3 pt-2">
        <OrganizationSwitcher
          hidePersonal
          appearance={{
            elements: {
              rootBox: 'w-full',
              organizationSwitcherTrigger:
                'w-full flex items-center gap-2 py-2 px-3 text-sm rounded-md border border-gray-300 hover:bg-gray-100',
              organizationPreviewText:
                'truncate max-w-[120px] overflow-hidden text-sm font-medium',
              organizationImage: 'w-5 h-5',
              organizationSwitcherPopoverCard: 'w-72',
            },
          }}
        />
      </SidebarContent>
    </Sidebar>
  );
};

export default OrganizationOverview;