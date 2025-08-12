import type { Route } from "./+types/grid";
import React from 'react';
import Grid from '../components/containers/Grid';
import Column from '../components/containers/Column';
import Card from '../components/containers/Card';
import Slot from '../components/slots/Slot';
import InlineCode from '../components/text/InlineCode';

// describe the route
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Grid" },
    { name: "description", content: "Grid Demo" },
  ];
}

export default function Component() {
  return (
    <Column>
      <Card>
        <Slot name="subtitle">Basic Grid</Slot>
        <Slot name="description">Default 3 columns grid with equal width</Slot>
        <Grid columns={3} gap="1em">
          <div style={{ border: '1px solid green', padding: '1em' }}>Cell 1</div>
          <div style={{ border: '1px solid blue', padding: '1em' }}>Cell 2</div>
          <div style={{ border: '1px solid red', padding: '1em' }}>Cell 3</div>
        </Grid>
      </Card>

      <Card border>
        <Slot name="subtitle">Variable Columns</Slot>
        <Slot name="description">Use <InlineCode>columns</InlineCode> prop as template string</Slot>
        <Grid columns="2fr 1fr 1fr" gap="0.5em">
          <div style={{ border: '1px solid green', padding: '1em' }}>2fr</div>
          <div style={{ border: '1px solid blue', padding: '1em' }}>1fr</div>
          <div style={{ border: '1px solid red', padding: '1em' }}>1fr</div>
        </Grid>
      </Card>

      <Card border>
        <Slot name="subtitle">Centered Items</Slot>
        <Slot name="description">Use <InlineCode>center</InlineCode> prop to center content</Slot>
        <Grid columns={3} center style={{ height: '150px', border: '1px solid green' }}>
          <div>☀️</div>
          <div>🌙</div>
          <div>⭐️</div>
        </Grid>
      </Card>
    </Column>
  );
}
