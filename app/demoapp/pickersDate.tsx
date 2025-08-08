import type { Route } from "./+types/pickersDate";
import React from 'react';
import Column from '../components/containers/Column';
import Card from '../components/containers/Card';
import Slot from '../components/slots/Slot';
import DatePicker from '../components/pickers/DatePicker';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Date Picker' },
    { name: 'description', content: 'DatePicker Demo' },
  ];
}

export default function Component() {
  const [date, setDate] = React.useState<Date | null>(new Date());
  const [range, setRange] = React.useState<{ start?: Date; end?: Date }>({});

  return (
    <Column>
      <Card>
        <Slot name="title">DatePicker</Slot>
      </Card>

      <Card border>
        <Slot name="subtitle">Single Date</Slot>
        <DatePicker value={date ?? undefined} onChange={(d) => setDate(d)} />
      </Card>

      <Card border>
        <Slot name="subtitle">Range</Slot>
        <DatePicker range rangeValue={range} onRangeChange={setRange} />
        <div style={{ marginTop: '0.5em' }}>
          {range.start ? range.start.toLocaleDateString() : '—'}
          {'  to  '}
          {range.end ? range.end.toLocaleDateString() : '—'}
        </div>
      </Card>
    </Column>
  );
}
