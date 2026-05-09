import { useState, useRef, useContext, createContext } from 'react';
import dropdownIcon from '../assets/icons/dropdown.svg';

const CollapsibleGroupContext = createContext(null);

let _idCounter = 0;

export function CollapsibleGroup({ children }) {
  const [openId, setOpenId] = useState(null);
  return (
    <CollapsibleGroupContext.Provider value={{ openId, setOpenId }}>
      {children}
    </CollapsibleGroupContext.Provider>
  );
}

function CollapsibleItem({
  photo,
  photoAlt,
  title,
  statusLabel,
  statusClass,
  meta,
  highlight,
  isExpanded: controlledExpanded,
  onToggle: controlledToggle,
  children,
  wrapperClassName,
  headerClassName,
  titleContainerClassName,
  contentClassName,
  TitleTag = 'h3',
}) {
  const group = useContext(CollapsibleGroupContext);

  const idRef = useRef(null);
  if (idRef.current === null) idRef.current = ++_idCounter;
  const id = idRef.current;

  const [internalOpen, setInternalOpen] = useState(false);

  let isOpen, handleToggle;
  if (controlledExpanded !== undefined) {
    isOpen = controlledExpanded;
    handleToggle = controlledToggle;
  } else if (group) {
    isOpen = group.openId === id;
    handleToggle = () => group.setOpenId((prev) => (prev === id ? null : id));
  } else {
    isOpen = internalOpen;
    handleToggle = () => setInternalOpen((prev) => !prev);
  }

  return (
    <div className={wrapperClassName ?? 'dashboard-item-wrapper'}>
      <button className={headerClassName ?? 'dashboard-item'} onClick={handleToggle}>
        {photo != null && (
          <img src={photo} alt={photoAlt || ''} className="dashboard-item-photo" />
        )}
        <div className={titleContainerClassName ?? 'dashboard-item-info'}>
          <TitleTag>{title}</TitleTag>
          {meta && <p className="dashboard-item-meta">{meta}</p>}
          {highlight && <p className="dashboard-item-highlight">{highlight}</p>}
        </div>
        {statusLabel && (
          <span className={`status-badge ${statusClass || ''}`}>{statusLabel}</span>
        )}
        <img
          src={dropdownIcon}
          alt="toggle"
          className={`dashboard-item-chevron ${isOpen ? 'up' : ''}`}
        />
      </button>

      {isOpen && children && (
        <div className={contentClassName ?? 'dashboard-item-details'}>{children}</div>
      )}
    </div>
  );
}

export default CollapsibleItem;
