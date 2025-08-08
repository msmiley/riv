import React from 'react';
import { cls } from '../../utils';
import { createPortal } from 'react-dom';
import styles from './popups.module.css';

interface TooltipProps extends React.PropsWithChildren {
  /** Content of the tooltip */
  content: React.ReactNode;
  /** Preferred placement, fallback automatically flips */
  placement?: 'top' | 'bottom';
  /** Add className to trigger */
  className?: string;
  /** Delay before showing tooltip (ms) */
  delay?: number;
}

export default function Tooltip({ children, content, placement = 'top', className, delay = 500 }: TooltipProps) {
  // Create a container for the portal
  const [container] = React.useState(() => document.createElement('div'));
  
  // append container to body once
  React.useEffect(() => {
    document.body.appendChild(container);
    return () => {
      document.body.removeChild(container);
    };
  }, [container]);
  
  // internal open state and anchor for trigger
  const [isOpen, setIsOpen] = React.useState(false);
  const [actualPlacement, setActualPlacement] = React.useState<'top' | 'bottom'>(placement);
  const [arrowOffset, setArrowOffset] = React.useState<number>(0);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  // state for popup style
  const [popupStyle, setPopupStyle] = React.useState<React.CSSProperties>({ position: 'absolute', top: '0px', left: '0px', visibility: 'hidden' });

  // position tooltip on mount/update
  React.useLayoutEffect(() => {
    if (!isOpen || !anchorRef.current || !tooltipRef.current) return;
    const triggerRect = anchorRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    
    // vertical: prefer placement, flip if overflowing
    let top = triggerRect.bottom + scrollY + 8; // gap for arrow
    let finalPlacement: 'top' | 'bottom' = 'bottom';
    
    if (placement === 'top') {
      // Try top first
      const topPosition = triggerRect.top + scrollY - tooltipRect.height - 8;
      if (topPosition >= scrollY + 10) {
        // Enough space above
        top = topPosition;
        finalPlacement = 'top';
      } else {
        // Not enough space above, use bottom
        top = triggerRect.bottom + scrollY + 8;
        finalPlacement = 'bottom';
      }
    } else {
      // Try bottom first
      if (top + tooltipRect.height <= scrollY + window.innerHeight - 10) {
        // Enough space below
        finalPlacement = 'bottom';
      } else {
        // Not enough space below, use top
        top = triggerRect.top + scrollY - tooltipRect.height - 8;
        finalPlacement = 'top';
      }
    }
    
    setActualPlacement(finalPlacement);
    
    // horizontal: center on trigger, adjust if overflowing
    const triggerCenterX = triggerRect.left + scrollX + (triggerRect.width / 2);
    let left = triggerCenterX - (tooltipRect.width / 2);
    let arrowOffsetValue = 0;
    
    if (left < scrollX + 10) {
      // Tooltip would go off left edge
      const newLeft = scrollX + 10;
      arrowOffsetValue = triggerCenterX - newLeft - (tooltipRect.width / 2);
      // Clamp arrow to stay within tooltip bounds (with 12px margin for arrow size)
      arrowOffsetValue = Math.max(-tooltipRect.width / 2 + 12, Math.min(tooltipRect.width / 2 - 12, arrowOffsetValue));
      left = newLeft;
    } else if (left + tooltipRect.width > scrollX + window.innerWidth - 10) {
      // Tooltip would go off right edge
      const newLeft = scrollX + window.innerWidth - tooltipRect.width - 10;
      arrowOffsetValue = triggerCenterX - newLeft - (tooltipRect.width / 2);
      // Clamp arrow to stay within tooltip bounds (with 12px margin for arrow size)
      arrowOffsetValue = Math.max(-tooltipRect.width / 2 + 12, Math.min(tooltipRect.width / 2 - 12, arrowOffsetValue));
      left = newLeft;
    }
    
    setArrowOffset(arrowOffsetValue);
    
    // apply position and show
    setPopupStyle({ position: 'absolute', top: `${top}px`, left: `${left}px`, visibility: 'visible' });
  }, [isOpen, placement, container]);

  // handle mouse enter/leave with delay
  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(false);
  };

  // cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={styles.tooltip}>
      <div 
        ref={anchorRef} 
        className={
          className
            ? cls(styles.tooltipTrigger, className)
            : styles.tooltipTrigger
        }
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      {isOpen && createPortal(
        <div 
          ref={tooltipRef} 
          className={cls(styles.tooltipContent, actualPlacement === 'top' ? styles.tooltipArrowTop : styles.tooltipArrowBottom)} 
          style={{
            ...popupStyle,
            '--arrow-offset': `${arrowOffset}px`
          } as React.CSSProperties}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {content}
        </div>,
        container
      )}
    </div>
  );
}
