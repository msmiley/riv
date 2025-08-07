import type { Route } from "./+types/popupsDropdown";
import Column from '../components/containers/Column';
import Row from '../components/containers/Row';
import Card from '../components/containers/Card';
import Slot from '../components/slots/Slot';
import Button from '../components/buttons/Button';
import Dropdown from '../components/popups/Dropdown';
import type { PopupTriggerSlotProps } from '~/types';
import ListButton from "~/components/lists/ListButton";
import InlineCode from "~/components/text/InlineCode";

// describe the route
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dropdown" },
    { name: "description", content: "Demo of Dropdown popup component" },
  ];
}

export default function Component() {

  return (
    <Column grow>
      <Card color="var(--riv-green)">
        <Slot name="title">Dropdown Demo</Slot>
      </Card>
      <Column grow justify="space-between">
        <Card border>
          <Slot name="subtitle">Basic Dropdown</Slot>
          <Slot name="description">Click the button to toggle dropdown</Slot>
          <Row justify="space-between">
            <Dropdown>
              <Slot name="trigger">
                {({ onClick }: PopupTriggerSlotProps) => (
                  <Button onClick={onClick}>Toggle</Button>
                )}
              </Slot>
              <Slot name="default">
                <ListButton onClick={() => console.log('Item 1 clicked')}>Item Button 1</ListButton>
                <ListButton onClick={() => console.log('Item 2 clicked')}>Item Button 2</ListButton>
                <ListButton onClick={() => console.log('Item 3 clicked')}>Item Button 3</ListButton>
              </Slot>
            </Dropdown>
            <Dropdown>
              <Slot name="trigger">
                {({ onClick }: PopupTriggerSlotProps) => (
                  <Button onClick={onClick}>Toggle</Button>
                )}
              </Slot>
              <Slot name="default">
                <ListButton onClick={() => console.log('Item 1 clicked')}>Item Button 1</ListButton>
                <ListButton onClick={() => console.log('Item 2 clicked')}>Item Button 2</ListButton>
                <ListButton onClick={() => console.log('Item 3 clicked')}>Item Button 3</ListButton>
              </Slot>
            </Dropdown>
          </Row>
        </Card>
        <Card border>
          <Slot name="subtitle">Right-aligned Dropdown</Slot>
          <Slot name="description">
            Force Dropdown aligned to the right edge of the trigger with <InlineCode>right</InlineCode> prop
          </Slot>
          <Row justify="space-between">
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
        <Card border>
          <Slot name="subtitle">Auto-Positioning</Slot>
          <Slot name="description">
            Dropdown will automatically position itself based on available space
          </Slot>
          <Row justify="space-between">
            <Dropdown>
              <Slot name="trigger">
                {({ onClick }: PopupTriggerSlotProps) => (
                  <Button onClick={onClick}>Avoid Bottom</Button>
                )}
              </Slot>
              <Slot name="default">
                <ListButton onClick={() => console.log('Right 1')}>Button 1</ListButton>
                <ListButton onClick={() => console.log('Right 2')}>Button 2</ListButton>
              </Slot>
            </Dropdown>
            <Dropdown>
              <Slot name="trigger">
                {({ onClick }: PopupTriggerSlotProps) => (
                  <Button onClick={onClick}>Right Toggle</Button>
                )}
              </Slot>
              <Slot name="default">
                <ListButton onClick={() => console.log('Right 1')}>List Button With Long Name 1</ListButton>
                <ListButton onClick={() => console.log('Right 2')}>List Button With Long Name 2</ListButton>
              </Slot>
            </Dropdown>
          </Row>
        </Card>
      </Column>
    </Column>
  );
}
