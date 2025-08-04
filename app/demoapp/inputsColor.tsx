import type { Route } from "./+types/inputsColor";
import React from 'react';
import Column from '../components/containers/Column';
import Row from '../components/containers/Row';
import Card from '../components/containers/Card';
import Slot from '../components/slots/Slot';
import ColorPicker from '../components/pickers/ColorPicker';

// describe the route
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Inputs | Color" },
    { name: "description", content: "Demo of Color Inputs" },
  ];
}

export default function Component() {
  const [color, setColor] = React.useState<string>('#ff0000');
  return (
    <Column>
      <Card color="var(--riv-green)">
        <Slot name="title">Color Picker Demo</Slot>
      </Card>
      <Column>
        <Row>
          <Card border>
            <Slot name="subtitle">Basic</Slot>
            <Slot name="description">Default color picker</Slot>
            <ColorPicker value={color} onChange={setColor}>
              <Slot name="label">Pick Color</Slot>
              <Slot name="description">Choose a hex color</Slot>
            </ColorPicker>
            <div style={{
              marginTop: '1em',
              width: '50px',
              height: '50px',
              backgroundColor: color,
              border: '1px solid var(--riv-control-border-color)'
            }} />
          </Card>
          <Card border>
            <Slot name="subtitle">Disabled</Slot>
            <Slot name="description">Disabled picker</Slot>
            <ColorPicker value={color} onChange={setColor} disabled>
              <Slot name="label">Disabled</Slot>
            </ColorPicker>
          </Card>
        </Row>
      </Column>
    </Column>
  );
}
