
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Shell } from '@/components/Shell';

const WebsiteLoadingState: React.FC = () => {
  return (
    <Shell>
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-medical-600" />
      </div>
    </Shell>
  );
};

export default WebsiteLoadingState;
