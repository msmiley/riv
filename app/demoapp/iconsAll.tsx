import type { Route } from './+types/iconsAll';
import React from 'react';
import Column from '../components/containers/Column';
import Row from '../components/containers/Row';
import Card from '../components/containers/Card';
import Slot from '../components/slots/Slot';
import Icon from '../components/icons/Icon';

// Vite glob import of all icons for listing
const svgs: any = import.meta.glob('../components/icons/**/*.svg', { query: '?react', eager: true });

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Icons' },
    { name: 'description', content: 'All available icon components' },
  ];
}

export default function Component() {
  // Prepare sorted list of icon names and components
  const icons = React.useMemo(() => {
    const entries: { name: string; Comp: React.ComponentType<any> }[] = [];
    for (const path in svgs) {
      const Comp = svgs[path].default;
      const fileName = path.split('/').pop() || '';
      const name: string = fileName.replace(/\.svg$/i, '').toLowerCase();
      entries.push({ name, Comp });
    }
    return entries.sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  return (
    <Column>
      <Card>
        <Slot name="title">Icons</Slot>
      </Card>

      <Card border>
        <Slot name="subtitle">Available Icons</Slot>
        <Slot name="description">Use these names with the Icon component</Slot>
        <Row style={{ gap: '1em' }}>
          {icons.map(({ name }) => (
            <Card key={name}>
              <Column center gap="1em">
                <Icon name={name} scale={3}/>
                {name}
              </Column>
            </Card>
          ))}
        </Row>
      </Card>
    </Column>
  );
}
