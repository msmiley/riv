import React from 'react';
import useRiv from '~/hooks/useRiv';
import Image from './Image';
import Icon from '~/components/icons/Icon';
import { cls } from '~/utils';

export interface UserAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;          // square size in px
  circle?: boolean;       // force circle mask (default true)
  fallbackIcon?: string;  // override default icon name
  alt?: string;           // alt text for image
  showIconBackground?: boolean; // add subtle bg behind icon when no avatar
}

export default function UserAvatar({ size = 48, circle = true, fallbackIcon = 'user', alt = 'User avatar', showIconBackground = false, className, style, ...rest }: UserAvatarProps) {
  const { state } = useRiv();
  const src = state?.avatar?.trim() ? state.avatar : '';
  const dimension = { width: size, height: size };

  return (
    <div
      className={cls('riv-user-avatar', className || '')}
      style={{ position: 'relative', lineHeight: 0, flex: 'none', ...dimension, ...style }}
      {...rest}
    >
      {src ? (
        <Image
          src={src}
          circle={circle}
          alt={alt}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div
          className={cls('riv-user-avatar-fallback', circle ? 'circle' : '')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: circle ? '50%' : 6,
            width: '100%',
            height: '100%',
            background: showIconBackground ? 'var(--riv-surface-raised, #2e2e2f)' : 'transparent',
            color: 'var(--riv-fg-on-color, #fff)',
            fontSize: Math.round(size * 0.55),
            flex: 'none',
          }}
          aria-label={alt}
        >
          <Icon name={fallbackIcon} scale={0.7} />
        </div>
      )}
    </div>
  );
}
