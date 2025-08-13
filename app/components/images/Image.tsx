import React, { forwardRef } from 'react';
import styles from './images.module.css';
import { cls } from '~/utils';

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  circle?: boolean;      // mask image to a circle
  raw?: boolean;         // disables auto-resize (natural img behavior)
  min?: number | string; // minimum for width or height (px by default for numbers)
  fillWidth?: boolean;   // prioritize width
  fillHeight?: boolean;  // prioritize height
}

/**
 * Image component
 * - Default: fills its container (width/height 100%) maintaining aspect via object-fit: cover.
 * - fillWidth: width 100%, height auto (no crop).
 * - fillHeight: height 100%, width auto (no crop).
 * - circle: masks to a circle using the wrapper.
 * - raw: bypass auto-resize styles; optionally still wrap if circle is set.
 */
const Image = forwardRef<HTMLImageElement, ImageProps>(function Image(
  { src, circle, raw, min, fillWidth, fillHeight, className, style, ...imgProps },
  ref
) {
  // Normalize min value to a CSS string
  const toCssSize = (v: number | string | undefined) =>
    typeof v === 'number' ? `${v}px` : v;

  // Determine whether to render with a wrapper (needed for circle mask or default filling)
  const needsWrapper = !!circle || !raw;

  // Compute image inline styles depending on props
  const imgStyle: React.CSSProperties = raw
    ? { ...style }
    : (() => {
        const s: React.CSSProperties = { ...style };
        const minCss = toCssSize(min);

        if (fillWidth) {
          s.width = '100%';
          s.height = 'auto';
          if (minCss) s.minWidth = minCss;
        } else if (fillHeight) {
          s.height = '100%';
          s.width = 'auto';
          if (minCss) s.minHeight = minCss;
        } else {
          // Default: fill container in both axes and crop as needed
          s.width = '100%';
          s.height = '100%';
          s.objectFit = 'cover';
          if (minCss) {
            s.minWidth = minCss;
            s.minHeight = minCss;
          }
        }
        // Avoid stretching beyond container
        s.maxWidth = s.maxWidth ?? '100%';
        s.maxHeight = s.maxHeight ?? '100%';
        return s;
      })();

  const imgEl = (
    <img
      ref={ref}
      src={src}
      className={cls(styles.img, className || '')}
      style={imgStyle}
      {...imgProps}
    />
  );

  if (!needsWrapper) return imgEl;

  return (
    <div className={cls(styles.wrapper, { [styles.circle]: circle })}>
      {imgEl}
    </div>
  );
});

export default Image;
