import type { Route } from "./+types/popupsDropdown";
import Column from '../components/containers/Column';
import Row from '../components/containers/Row';
import Card from '../components/containers/Card';
import Slot from '../components/slots/Slot';
import Button from '../components/buttons/Button';
import Dropdown from '../components/popups/Dropdown';
import type { PopupTriggerSlotProps } from '~/types';

// describe the route
export function meta({}: Route.MetaArgs) {
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
          <Row>
            <Dropdown>
              <Slot name="trigger">
                {({ onClick }: PopupTriggerSlotProps) => (
                  <Button onClick={onClick}>Toggle</Button>
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
          </Row>
        </Card>
      </Row>
    </Column>
  );
}
