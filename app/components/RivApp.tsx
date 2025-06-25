import { PropsWithChildren } from 'react';
import useSlot from '../hooks/useSlot';

interface RivAppProps extends PropsWithChildren {
  title: string;
}

export default function RivApp(props: RivAppProps) {

  return (
    <div className="riv-app riv-fonts">
      <div className="riv-app-banner">
        {useSlot(props.children, 'banner')}
      </div>

      <div className="riv-app-main">
        {/* LAYOUT SLOT */}
        {useSlot(props.children, 'layout')}
      </div>

        {/* SLOT FOR CUSTOM LOGIN PAGE */}
            {/* BUILT-IN LOGIN PAGE */}
      <div className="riv-app-footer">
        {useSlot(props.children, 'footer')}
      </div>
    </div>
  );
}
