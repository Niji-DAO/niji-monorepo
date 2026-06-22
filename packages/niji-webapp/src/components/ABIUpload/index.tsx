import React from 'react';

import { Form } from 'react-bootstrap';

interface ABIUploadProps {
  abiFileName?: string;
  isValid: boolean | undefined;
  isInvalid: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ABIUpload: React.FC<ABIUploadProps> = ({ abiFileName, isValid, isInvalid, onChange }) => {
  const displayLabel = abiFileName === 'etherscan-abi-download.json' ? abiFileName : 'ABI';

  return (
    <div className="mt-4">
      <label htmlFor="import-abi" className="opacity-50">
        {displayLabel}
      </label>
      <Form.Control
        className="h-12 w-full rounded-[15px] border border-black/10 px-4 py-2 text-[22px] font-bold text-[color:var(--brand-cool-dark-text)]"
        type="file"
        id="import-abi"
        size="lg"
        accept="application/JSON"
        isValid={isValid}
        isInvalid={isInvalid}
        onChange={onChange}
      />
    </div>
  );
};

export default ABIUpload;
