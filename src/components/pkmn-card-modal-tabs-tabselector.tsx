type Props = {
  isActive: boolean,
  children: string,
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void,
}

// wrapper component for tabs
export const TabSelector = ({ isActive, children, onClick} : Props) => (
    <button
      className={` ${isActive ? 'tab tab-active' : 'tab'} `}
      onClick={onClick}
    >
      {children}
    </button>
);