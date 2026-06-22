import React from 'react';

import clsx from 'clsx';
import { NumericFormat, OnValueChange } from 'react-number-format';

interface BrandNumericEntryProps {
  onValueChange?: OnValueChange;
  value?: string | number;
  placeholder?: string;
  label?: string;
  isInvalid?: boolean;
}

const ENTRY_CLASS =
  'mb-2 mt-1 h-12 w-full rounded-[15px] border border-black/10 px-4 py-2 text-[22px] font-bold text-[color:var(--brand-cool-dark-text)] outline-none transition-all duration-[125ms] ease-in-out';
const INVALID_CLASS = '!border-2 !border-[color:var(--brand-color-red)]';

const BrandNumericEntry: React.FC<BrandNumericEntryProps> = props => {
  const { onValueChange, value, placeholder, label, isInvalid = false } = props;

  return (
    <div className="relative mt-4 w-full">
      {label && <span className="opacity-50">{label}</span>}
      <NumericFormat
        onValueChange={onValueChange}
        value={value}
        placeholder={placeholder}
        className={clsx(ENTRY_CLASS, isInvalid ? INVALID_CLASS : '')}
        allowNegative={false}
        thousandSeparator=","
      />
    </div>
  );
};

export default BrandNumericEntry;
