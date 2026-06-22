const NavBarItem: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}> = props => {
  const { onClick, children, className } = props;
  return (
    <div
      className={`mr-4 flex items-center justify-center max-[992px]:!bg-transparent max-[992px]:!text-[color:var(--brand-black)] max-[992px]:hover:!bg-transparent [&_a]:text-[color:var(--brand-black)] hover:[&_a]:text-[color:var(--brand-dark-red)] ${className ?? ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
export default NavBarItem;
