import React from 'react';

import clsx from 'clsx';

interface BrandTextEntryProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string | number;
  placeholder?: string;
  type?: string;
  min?: string;
  label?: string;
  isInvalid?: boolean;
}

const ENTRY_CLASS =
  'mb-2 mt-1 h-12 w-full rounded-[15px] border border-black/10 px-4 py-2 text-[22px] font-bold text-[color:var(--brand-cool-dark-text)] outline-none transition-all duration-[125ms] ease-in-out';
const INVALID_CLASS = '!border-2 !border-[color:var(--brand-color-red)]';

const BrandTextEntry: React.FC<BrandTextEntryProps> = props => {
  const { onChange, value, placeholder, type, min, label, isInvalid = false } = props;

  return (
    <div className="relative mt-4 w-full">
      {label && <span className="opacity-50">{label}</span>}
      <input
        onChange={onChange}
        value={value}
        type={type ? type : 'string'}
        min={min}
        placeholder={placeholder}
        className={clsx(ENTRY_CLASS, isInvalid ? INVALID_CLASS : '')}
      />
    </div>
  );
};

export default BrandTextEntry;
