interface VoteStatusPillProps {
  status: string;
  text: React.ReactNode;
}

const NOUN_BUTTON_CLASS =
  "my-[5px] flex h-7 w-fit flex-row items-center justify-center rounded-lg px-2 py-0 align-middle font-['PT_Root_UI'] text-sm font-bold";

const VoteStatusPill: React.FC<VoteStatusPillProps> = props => {
  const { status, text } = props;
  switch (status) {
    case 'success':
      return (
        <div
          className={`bg-[color:var(--brand-color-blue-translucent)] text-[color:var(--brand-color-blue)] ${NOUN_BUTTON_CLASS}`}
        >
          {text}
        </div>
      );
    case 'failure':
      return (
        <div
          className={`bg-[color:var(--brand-color-red-translucent)] text-[color:var(--brand-color-red)] ${NOUN_BUTTON_CLASS}`}
        >
          {text}
        </div>
      );
    default:
      return (
        <div
          className={`bg-[color:var(--brand-color-green-translucent)] text-[color:var(--brand-color-green)] ${NOUN_BUTTON_CLASS}`}
        >
          {text}
        </div>
      );
  }
};

export default VoteStatusPill;
