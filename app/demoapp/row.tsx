import React from 'react';
import Column from '../components/containers/Column';
import Row from '../components/containers/Row';
import Card from '../components/containers/Card';
import Slot from '../components/slots/Slot';
import InlineCode from '../components/text/InlineCode';
import type { Route } from "./+types/row";

// describe the route
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Row" },
    { name: "description", content: "Row Demo" },
  ];
}

export default function Component() {
  return (
    <Column>
      <Card color="var(--riv-blue)">
        <Slot name="title">Row Demo</Slot>
      </Card>

      <Card border>
        <Slot name="subtitle">Basic Row</Slot>
        <Slot name="description">Default horizontal stacking of items</Slot>
        <Row>
          <div>Item A</div>
          <div>Item B</div>
          <div>Item C</div>
        </Row>
      </Card>

      <Card border>
        <Slot name="subtitle">Centered</Slot>
        <Slot name="description">Use <InlineCode>center</InlineCode> to align along the axis</Slot>
        <Row center style={{ height: '100px', border: '1px solid green' }}>
          <div style={{ height: '20px', backgroundColor: 'blue' }}>Centered A</div>
          <div style={{ height: '40px', backgroundColor: 'blue' }}>Centered B</div>
        </Row>
      </Card>

      <Card border>
        <Slot name="subtitle">Justify Content</Slot>
        <Slot name="description">Use <InlineCode>justify</InlineCode> prop</Slot>
        <Row justify="space-between" style={{ border: '1px solid green', padding: '0.5em' }}>
          <div>Left</div>
          <div>Right</div>
        </Row>
      </Card>

      <Card border>
        <Slot name="subtitle">Gap & Wrap</Slot>
        <Slot name="description">Default wraps when items overflow, use <InlineCode>gap</InlineCode></Slot>
        <Row gap="1em" style={{ width: '150px', border: '1px solid green', padding: '0.5em' }}>
          <div>One</div>
          <div>Two</div>
          <div>Three</div>
          <div>Four</div>
          <div>Five</div>
          <div>Six</div>
        </Row>
      </Card>

      <Card border>
        <Slot name="subtitle">No Wrap</Slot>
        <Slot name="description">Use <InlineCode>nowrap</InlineCode> to prevent wrapping</Slot>
        <Row gap="1em" nowrap style={{ width: '150px', border: '1px solid green', padding: '0.5em' }}>
          <div>One</div>
          <div>Two</div>
          <div>Three</div>
          <div>Four</div>
          <div>Five</div>
          <div>Six</div>
        </Row>
      </Card>
    </Column>
  );
}
