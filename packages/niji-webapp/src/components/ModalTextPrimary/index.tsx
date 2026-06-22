interface ModalTextPrimaryProps {
  children?: React.ReactNode;
}

const ModalTextPrimary = ({ children }: Readonly<ModalTextPrimaryProps>) => (
  <div className="mb-2 text-[22px] font-bold text-[color:var(--brand-cool-dark-text)]">
    {children}
  </div>
);
export default ModalTextPrimary;
