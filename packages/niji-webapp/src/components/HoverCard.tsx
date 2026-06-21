import React from 'react';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface HoverCardProps {
  hoverCardContent: (dataTip: string) => React.ReactNode;
  tip: string;
  id: string;
  children: React.ReactNode;
}

const HoverCard: React.FC<HoverCardProps> = props => {
  const { hoverCardContent, tip } = props;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span>{props.children}</span>
      </TooltipTrigger>
      <TooltipContent className="!box-border !h-fit !w-max !min-w-[217px] !rounded-xl !border !border-gray-200 !bg-white !text-black !shadow-sm">
        {hoverCardContent(tip)}
      </TooltipContent>
    </Tooltip>
  );
};

export default HoverCard;
