// import type { Route } from "./+types/popupsDropdown"; // removed missing type import
import React from 'react';
import Column from '../components/containers/Column';
import Row from '../components/containers/Row';
import Card from '../components/containers/Card';
import Slot from '../components/slots/Slot';
import Button from '../components/buttons/Button';
import Dropdown from '../components/popups/Dropdown';
import type { DropdownButtonSlotProps } from '~/types';

// describe the route
export function meta() {
  return [
    { title: "Dropdown" },
    { name: "description", content: "Demo of Dropdown popup component" },
  ];
}

export default function Component() {

  return (
    <Column>
      <Card color="var(--riv-green)">
        <Slot name="title">Dropdown Demo</Slot>
      </Card>

      <Row>
        <Card border>
          <Slot name="subtitle">Basic Dropdown</Slot>
          <Slot name="description">Click the button to toggle dropdown</Slot>
          <div style={{ position: 'relative' }}>
            <Dropdown>
              <Slot name="button">
                {({ ref, onClick }: DropdownButtonSlotProps) => (
                  <div ref={ref} style={{ display: 'inline-block' }}>
                    <Button onClick={onClick}>Toggle</Button>
                  </div>
                )}
              </Slot>
              <Slot name="default">
                <Card>
                  <div>Item 1</div>
                  <div>Item 2</div>
                  <div>Item 3</div>
                </Card>
              </Slot>
            </Dropdown>
          </div>
        </Card>
      </Row>
    </Column>
  );
}
