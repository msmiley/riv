import type { Route } from "./+types/popupsDropdown";
import Column from '../components/containers/Column';
import Row from '../components/containers/Row';
import Card from '../components/containers/Card';
import Slot from '../components/slots/Slot';
import Button from '../components/buttons/Button';
import Dropdown from '../components/popups/Dropdown';
import type { PopupTriggerSlotProps } from '~/types';
import ListButton from "~/components/lists/ListButton";

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
                <ListButton onClick={() => console.log('Item 1 clicked')}>Item 1</ListButton>
                <ListButton onClick={() => console.log('Item 2 clicked')}>Item 2</ListButton>
                <ListButton onClick={() => console.log('Item 3 clicked')}>Item 3</ListButton>
              </Slot>
            </Dropdown>
          </Row>
        </Card>
      </Row>
      {/* Right-aligned example */}
      <Row>
        <Card border>
          <Slot name="subtitle">Right-aligned Dropdown</Slot>
          <Slot name="description">
            Dropdown aligned to the right edge of the trigger
          </Slot>
          <Row>
            <Dropdown right>
              <Slot name="trigger">
                {({ onClick }: PopupTriggerSlotProps) => (
                  <Button onClick={onClick}>Right Toggle</Button>
                )}
              </Slot>
              <Slot name="default">
                <ListButton onClick={() => console.log('Right 1')}>Right-aligned Button 1</ListButton>
                <ListButton onClick={() => console.log('Right 2')}>Right-aligned Button 2</ListButton>
              </Slot>
            </Dropdown>
          </Row>
        </Card>
      </Row>
    </Column>
  );
}
