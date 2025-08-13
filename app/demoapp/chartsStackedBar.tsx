import React from 'react';
import Column from '~/components/containers/Column';
import Row from '~/components/containers/Row';
import Card from '~/components/containers/Card';
import Slot from '~/components/slots/Slot';
import StackedBarChart, { type StackedBarCategory } from '~/components/charts/StackedBarChart';

const sampleData: StackedBarCategory[] = [
  { category: 'Q1', values: { Apples: 30, Oranges: 20, Bananas: 15 } },
  { category: 'Q2', values: { Apples: 25, Oranges: 35, Bananas: 10 } },
  { category: 'Q3', values: { Apples: 20, Oranges: 30, Bananas: 25 } },
  { category: 'Q4', values: { Apples: 35, Oranges: 15, Bananas: 20 } },
];

export default function ChartsStackedBarDemo() {
  return (
    <Column gap="1em">
      <h1>Stacked Bar Chart</h1>
      <p>Demonstration of the StackedBarChart component in vertical and horizontal orientations with configurable legend, gridlines, axes labels, and value labels.</p>
      <Row gap="1em" style={{ flexWrap: 'wrap' }}>
        <Card>
          <Slot name="title">Vertical (default)</Slot>
          <div style={{ width: 480 }}>
            <StackedBarChart value={sampleData} valueLabels legend gridlines axesLabels />
          </div>
        </Card>
        <Card>
          <Slot name="title">Horizontal</Slot>
          <div style={{ width: 480 }}>
            <StackedBarChart value={sampleData} horizontal valueLabels legend gridlines axesLabels />
          </div>
        </Card>
      </Row>
    </Column>
  );
}
