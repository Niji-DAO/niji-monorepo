import { Link } from 'react-router';

const NAV_BAR_LINK_CLASS =
  'mr-4 flex h-8 cursor-pointer items-center justify-center rounded-[50px] border-0 bg-white p-7 text-lg font-normal text-[color:var(--brand-black)] !no-underline hover:bg-[#f2f2f2] hover:!text-[color:var(--brand-dark-green)] max-[992px]:!bg-transparent max-[992px]:!text-[color:var(--brand-black)] max-[992px]:hover:!bg-transparent max-[992px]:hover:!text-[color:var(--brand-dark-green)]';

const NavBarLink: React.FC<{
  children: React.ReactNode;
  to: string;
  className?: string;
}> = props => {
  const { to, children, className } = props;
  // hacks to make React Router work with external links
  const onClick = () => (/http/.test(to) ? (window.location.href = to) : null);
  const target = /http/.test(to) ? '_blank' : '';
  return (
    <Link
      to={to}
      className={`${NAV_BAR_LINK_CLASS} ${className ?? ''}`}
      onClick={onClick}
      target={target}
    >
      {children}
    </Link>
  );
};
export default NavBarLink;
