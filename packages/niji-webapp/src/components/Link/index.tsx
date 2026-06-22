import React, { ReactNode } from 'react';

interface LinkProps {
  text: ReactNode;
  url: string;
  leavesPage: boolean;
}

const Link: React.FC<LinkProps> = ({ leavesPage, text, url }) => {
  return (
    <a
      className="text-[color:var(--brand-dark-red)] hover:text-[color:var(--brand-dark-red)] hover:underline active:text-[color:var(--brand-dark-red)]"
      href={url}
      target={leavesPage ? '_blank' : '_self'}
      rel="noreferrer"
    >
      {text}
    </a>
  );
};
export default Link;
