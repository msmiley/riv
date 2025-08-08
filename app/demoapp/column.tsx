import type { Route } from "./+types/column";
import React from 'react';
import Column from '../components/containers/Column';
import Row from '../components/containers/Row';
import Card from '../components/containers/Card';
import Slot from '../components/slots/Slot';
import InlineCode from '../components/text/InlineCode';

// describe the route
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Column" },
    { name: "description", content: "Column Demo" },
  ];
}

export default function Component() {
  return (
    <Column>
      <Card color="var(--riv-green)">
        <Slot name="title">Column Demo</Slot>
      </Card>

      <Card border>
        <Slot name="subtitle">Basic Stack</Slot>
        <Slot name="description">Default vertical stacking of items</Slot>
        <Column>
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </Column>
      </Card>

      <Card border>
        <Slot name="subtitle">Centered</Slot>
        <Slot name="description">Align children on axis by adding <InlineCode>center</InlineCode> prop</Slot>
        <Row style={{ height: '100px', border: '1px solid green' }}>
          <Column center grow>
            <div>Centered Item</div>
            <div>Another Centered Item</div>
          </Column>
        </Row>
      </Card>

      <Card border>
        <Slot name="subtitle">Custom Gap</Slot>
        <Slot name="description">Use <InlineCode>gap</InlineCode> prop to adjust spacing between items</Slot>
        <Column gap="1.5em" style={{ border: '1px solid var(--riv-control-border-color)', padding: '1em' }}>
          <div>Gap A</div>
          <div>Gap B</div>
        </Column>
      </Card>

      <Card border>
        <Slot name="subtitle">Flex Grow</Slot>
        <Slot name="description">Demonstrate <InlineCode>grow</InlineCode> prop</Slot>
        <Row style={{ height: '100px' }}>
          <Column grow style={{ border: '1px solid green' }}>
            <div>Grow = 1</div>
          </Column>
          <Column style={{ border: '1px solid blue' }}>
            <div>Grow = 0</div>
          </Column>
        </Row>
      </Card>
    </Column>
  );
}
