import styles from './icons.module.css';

// use Vite magic to pull in all svg modules
const svgs: any = import.meta.glob('./**/*.svg', { query: '?react', eager: true });
const iconComponents: any = {};
// prepare icon names
for (const path in svgs) {
  const component = svgs[path].default;
  // name from component (vite-svgr usually exports as Svg<FileName>)
  const compName: string = component.name?.replace?.(/^Svg/, '')?.toLowerCase?.() ?? '';
  // name from file path (kebab-case)
  const fileName = path.split('/').pop() || '';
  const fileKey = fileName.replace(/\.svg$/i, '').toLowerCase();
  if (compName) iconComponents[compName] = component;
  if (fileKey) iconComponents[fileKey] = component;
}

interface IconProps {
  name: string;
  /**
   * Scales the icon relative to its default size (1 = 100%).
   * Example: 1.5 makes the icon 150% of its normal size.
   */
  scale?: number;
}

export default function Icon(props: IconProps) {
  // noop
  if (!props.name) {
    return <></>;
  }
  // get the icon from our store, fallback to question mark for invalid name
  const key = props.name.toLowerCase();
  let IconComponent = iconComponents[key]
  if (!IconComponent) {
    console.warn(`Icon not found: ${props.name}`, Object.keys(iconComponents));
    IconComponent = iconComponents.question;
  }
  const scale = typeof props.scale === 'number' && isFinite(props.scale) && props.scale > 0 ? props.scale : 1;
  return (
    <div className={styles.icon} style={scale !== 1 ? { fontSize: `${scale}em` } : undefined}>
      <IconComponent/>
    </div>
  );
}
