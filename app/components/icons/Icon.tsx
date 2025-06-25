import styles from './icons.module.css';

// use Vite magic to pull in all svg modules
const svgs: any = import.meta.glob('./**/*.svg', { query: '?react', eager: true });
const iconComponents: any = {};
// prepare icon names
for (const path in svgs) {
  const component = svgs[path].default;
  const name: string = component.name.replace(/^Svg/, '').toLowerCase();
  iconComponents[name] = component;
}

interface IconProps {
  name: string;
}

export default function Icon(props: IconProps) {
  // noop
  if (!props.name) {
    return <></>;
  }
  // get the icon from our store
  const IconComponent = iconComponents[props.name];
  return (
    <div className={styles.icon}>
      <IconComponent/>
    </div>
  );
}
