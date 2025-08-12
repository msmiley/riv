import React, { useState, useEffect } from 'react';
import styles from './lists.module.css';
import useSlot from '~/hooks/useSlot';
import InputText from '~/components/inputs/InputText';
import Icon from '~/components/icons/Icon';
import { cls } from '~/utils';
import Button from '../buttons/Button';
import Slot from '../slots/Slot';

interface ListbarProps extends React.PropsWithChildren {
  items?: any[];  // Array of items to iterate over
  collapsed?: boolean;  // Whether the listbar is collapsed
  onCollapsedChange?: (collapsed: boolean) => void;  // Callback when collapse state changes
  searchPlaceholder?: string;  // Placeholder text for search input
  style?: React.CSSProperties;
}

// Listbar: collapsible sidebar with title, subtitle, description, toolbar, search, and items
export default function Listbar(props: ListbarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  
  // Use controlled or internal collapsed state
  const collapsed = props.collapsed !== undefined ? props.collapsed : internalCollapsed;
  const setCollapsed = props.onCollapsedChange || setInternalCollapsed;
  
  // Initialize showContent based on initial collapsed state
  const [showContent, setShowContent] = useState(!collapsed);
  
  // Handle external collapsed prop changes
  useEffect(() => {
    if (props.collapsed !== undefined) {
      if (props.collapsed) {
        setShowContent(false);
      } else {
        setTimeout(() => setShowContent(true), 300);
      }
    }
  }, [props.collapsed]);

  const title = useSlot(props.children, 'title');
  const subtitle = useSlot(props.children, 'subtitle');
  const description = useSlot(props.children, 'description');
  const toolbar = useSlot(props.children, 'toolbar');

  // Filter items based on search term
  const filteredItems = props.items?.filter(item => {
    if (!searchTerm) return true;
    
    // Simple text match - convert item to string and search
    const searchableText = typeof item === 'string' 
      ? item 
      : JSON.stringify(item).toLowerCase();
    
    return searchableText.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  const handleToggleCollapse = () => {
    const newCollapsed = !collapsed;
    
    if (newCollapsed) {
      // When collapsing, hide content immediately
      setShowContent(false);
    } else {
      // When expanding, show content after transition completes
      setTimeout(() => setShowContent(true), 300); // Match CSS transition duration
    }
    
    setCollapsed(newCollapsed);
  };

  return (
    <aside 
      className={cls(styles.listbar, { collapsed })}
      style={props.style}
      role="complementary"
      aria-label={title ? `${title} sidebar` : 'Sidebar'}
    >
      {/* Header */}
      <div className={styles.listbarHeader}>
        
        {showContent && !collapsed && (
          <div className={styles.listbarHeaderContent}>
            {title && <div className={styles.listbarTitle}>{title}</div>}
            {subtitle && <div className={styles.listbarSubtitle}>{subtitle}</div>}
            {description && <div className={styles.listbarDescription}>{description}</div>}
          </div>
        )}
        <Button variant="tight" onClick={handleToggleCollapse}
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          <Icon name={collapsed ? 'expand' : 'collapse'} />
        </Button>
      </div>

      {/* Search */}
      {showContent && !collapsed && props.items && props.items.length > 0 && (
        <div className={styles.listbarToolbar}>
          <InputText variant="clean" grow
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     placeholder={props.searchPlaceholder || 'Search...'}>
            <Slot name="icon">
              <Icon name="search"/>
            </Slot>
          </InputText>
          {toolbar}
        </div>
      )}

      {/* Items */}
      {showContent && !collapsed && filteredItems.length > 0 && (
        <div className={styles.listbarItems}>
          {filteredItems.map((item, index) => (
            <div key={index} className={styles.listbarItem}>
              {useSlot(props.children, 'item', { item, index })}
            </div>
          ))}
        </div>
      )}

      {/* No results message */}
      {showContent && !collapsed && searchTerm && filteredItems.length === 0 && props.items && props.items.length > 0 && (
        <div className={styles.listbarNoResults}>
          No items found for "{searchTerm}"
        </div>
      )}
    </aside>
  );
}
